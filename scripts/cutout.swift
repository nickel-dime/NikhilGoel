// Turns a photo of a garment into a square transparent-PNG cutout, using the
// Vision subject-lifting model that ships with macOS. No GUI, no network.
//
//   swiftc -O scripts/cutout.swift -o /tmp/cutout
//   /tmp/cutout in.heic out.png
//
// The subject is cropped to its own extent and then centred on a square canvas
// with a consistent margin, so every piece sits the same way in the grid no
// matter how the photo was framed.
//
// CUTOUT_THRESHOLD (default 0.8) sets how confident Vision must be before a
// pixel is kept. Vision's own composite keeps everything above ~0.5, which on a
// flat-lay drags in shadowed background right next to the garment. Raise it if
// background bleeds in, lower it if edges get eaten.
import AppKit
import CoreImage
import Foundation
import Vision

let MARGIN = 0.06 // fraction of the canvas left empty on the tightest side
let MAX_SIDE = 1600 // output cap; Sanity resizes anyway and 5000px helps nobody
let THRESHOLD = Float(ProcessInfo.processInfo.environment["CUTOUT_THRESHOLD"] ?? "") ?? 0.8
let FEATHER: Float = 0.06 // soft edge either side of the threshold

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data("error: \(message)\n".utf8))
  exit(1)
}

func note(_ message: String) {
  FileHandle.standardError.write(Data("  note: \(message)\n".utf8))
}

let args = CommandLine.arguments
guard args.count == 3 else { fail("usage: cutout <input> <output.png>") }
let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard let source = NSImage(contentsOf: inputURL),
  let cgImage = source.cgImage(forProposedRect: nil, context: nil, hints: nil)
else { fail("could not read \(inputURL.lastPathComponent)") }

let width = cgImage.width
let height = cgImage.height

// Isolate the foreground subject.
let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
do {
  try handler.perform([request])
} catch {
  fail("vision failed on \(inputURL.lastPathComponent): \(error.localizedDescription)")
}

guard let result = request.results?.first, !result.allInstances.isEmpty else {
  fail("no subject found in \(inputURL.lastPathComponent)")
}

/// Reads a Vision mask buffer into a float array at the given dimensions.
func readMask(_ mask: CVPixelBuffer) -> (values: [Float], width: Int, height: Int)? {
  CVPixelBufferLockBaseAddress(mask, .readOnly)
  defer { CVPixelBufferUnlockBaseAddress(mask, .readOnly) }
  guard let base = CVPixelBufferGetBaseAddress(mask) else { return nil }
  let mw = CVPixelBufferGetWidth(mask)
  let mh = CVPixelBufferGetHeight(mask)
  let stride = CVPixelBufferGetBytesPerRow(mask)
  let isFloat = CVPixelBufferGetPixelFormatType(mask) == kCVPixelFormatType_OneComponent32Float
  var values = [Float](repeating: 0, count: mw * mh)
  for y in 0..<mh {
    let row = base.advanced(by: y * stride)
    for x in 0..<mw {
      values[y * mw + x] =
        isFloat
        ? row.load(fromByteOffset: x * 4, as: Float.self)
        : Float(row.load(fromByteOffset: x, as: UInt8.self)) / 255
    }
  }
  return (values, mw, mh)
}

func mask(for instances: IndexSet) -> (values: [Float], width: Int, height: Int)? {
  guard let buffer = try? result.generateScaledMaskForImage(forInstances: instances, from: handler)
  else { return nil }
  return readMask(buffer)
}

// Keep only the largest instance. Merging every instance pulls in anything else
// Vision decided was foreground: a second garment, a bag, a fold of bedding.
var kept = result.allInstances
if result.allInstances.count > 1 {
  let areas = result.allInstances.map { instance -> (Int, Int) in
    guard let m = mask(for: IndexSet(integer: instance)) else { return (instance, 0) }
    return (instance, m.values.reduce(0) { $1 > 0.5 ? $0 + 1 : $0 })
  }
  guard let largest = areas.max(by: { $0.1 < $1.1 }) else {
    fail("no subject found in \(inputURL.lastPathComponent)")
  }
  kept = IndexSet(integer: largest.0)
  let dropped = areas.filter { $0.0 != largest.0 }.map { "\($0.1)" }.joined(separator: ", ")
  note("kept largest of \(areas.count) subjects (\(largest.1) px; dropped \(dropped))")
}

guard let subject = mask(for: kept) else {
  fail("could not build mask for \(inputURL.lastPathComponent)")
}

// Read the source pixels into a known layout.
var pixels = [UInt8](repeating: 0, count: width * height * 4)
pixels.withUnsafeMutableBytes { raw in
  guard
    let ctx = CGContext(
      data: raw.baseAddress, width: width, height: height, bitsPerComponent: 8,
      bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    )
  else { fail("could not read pixels") }
  ctx.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
}

// Apply the mask at our own threshold, and track the garment's bounding box.
var minX = width, minY = height, maxX = -1, maxY = -1
for y in 0..<height {
  // The mask can come back at a different resolution to the image.
  let my = min(subject.height - 1, y * subject.height / height)
  for x in 0..<width {
    let mx = min(subject.width - 1, x * subject.width / width)
    let m = subject.values[my * subject.width + mx]
    let alpha = max(0, min(1, (m - (THRESHOLD - FEATHER)) / (2 * FEATHER)))
    let i = (y * width + x) * 4
    if alpha <= 0.01 {
      pixels[i] = 0
      pixels[i + 1] = 0
      pixels[i + 2] = 0
      pixels[i + 3] = 0
    } else {
      // Premultiplied, so the colour channels scale with alpha too.
      pixels[i] = UInt8(Float(pixels[i]) * alpha)
      pixels[i + 1] = UInt8(Float(pixels[i + 1]) * alpha)
      pixels[i + 2] = UInt8(Float(pixels[i + 2]) * alpha)
      pixels[i + 3] = UInt8(alpha * 255)
      if x < minX { minX = x }
      if x > maxX { maxX = x }
      if y < minY { minY = y }
      if y > maxY { maxY = y }
    }
  }
}

// Optional cleanup for the case Vision gets confidently wrong: a shadow cast on
// the surface the garment is lying on, which it treats as part of the subject.
// Thresholding can't remove it, but it is neutral grey where the garment has
// colour, so flood inward from the cutout's edge and drop connected pixels with
// almost no saturation. Do NOT use this on a grey, white or black garment.
if ProcessInfo.processInfo.environment["CUTOUT_DROP_NEUTRAL"] == "1" {
  let limit = Float(ProcessInfo.processInfo.environment["CUTOUT_NEUTRAL_SAT"] ?? "") ?? 0.18

  func isNeutral(_ i: Int) -> Bool {
    let a = Float(pixels[i + 3]) / 255
    guard a > 0.01 else { return false }
    // Un-premultiply before judging colour.
    let r = Float(pixels[i]) / 255 / a
    let g = Float(pixels[i + 1]) / 255 / a
    let b = Float(pixels[i + 2]) / 255 / a
    let hi = max(r, max(g, b))
    let lo = min(r, min(g, b))
    return hi <= 0.01 ? true : (hi - lo) / hi < limit
  }

  var queue = [Int]()
  var seen = [Bool](repeating: false, count: width * height)

  // Seed from opaque pixels sitting on the transparent boundary.
  for y in 0..<height {
    for x in 0..<width {
      let p = y * width + x
      guard pixels[p * 4 + 3] > 2 else { continue }
      let onEdge =
        x == 0 || y == 0 || x == width - 1 || y == height - 1
        || pixels[(p - 1) * 4 + 3] <= 2 || pixels[(p + 1) * 4 + 3] <= 2
        || pixels[(p - width) * 4 + 3] <= 2 || pixels[(p + width) * 4 + 3] <= 2
      if onEdge && isNeutral(p * 4) {
        queue.append(p)
        seen[p] = true
      }
    }
  }

  var removed = 0
  while let p = queue.popLast() {
    let i = p * 4
    guard isNeutral(i) else { continue }
    pixels[i] = 0
    pixels[i + 1] = 0
    pixels[i + 2] = 0
    pixels[i + 3] = 0
    removed += 1
    let x = p % width
    let y = p / width
    for (dx, dy) in [(-1, 0), (1, 0), (0, -1), (0, 1)] {
      let nx = x + dx
      let ny = y + dy
      guard nx >= 0, ny >= 0, nx < width, ny < height else { continue }
      let n = ny * width + nx
      if !seen[n] && pixels[n * 4 + 3] > 2 {
        seen[n] = true
        queue.append(n)
      }
    }
  }

  if removed > 0 {
    note("dropped \(removed) px of neutral background bleed")
    // The bounding box may have shrunk, so recompute it.
    minX = width; minY = height; maxX = -1; maxY = -1
    for y in 0..<height {
      for x in 0..<width where pixels[(y * width + x) * 4 + 3] > 2 {
        if x < minX { minX = x }
        if x > maxX { maxX = x }
        if y < minY { minY = y }
        if y > maxY { maxY = y }
      }
    }
  }
}

guard maxX >= minX, maxY >= minY else {
  fail("nothing left above threshold \(THRESHOLD) in \(inputURL.lastPathComponent)")
}

let cropW = maxX - minX + 1
let cropH = maxY - minY + 1

guard
  let full = CGContext(
    data: &pixels, width: width, height: height, bitsPerComponent: 8,
    bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  )?.makeImage(),
  let cropped = full.cropping(
    to: CGRect(x: minX, y: minY, width: cropW, height: cropH)
  )
else { fail("could not crop to subject") }

// Centre on a square canvas, scaled to leave MARGIN on the long side.
var side = Int((Double(max(cropW, cropH)) / (1 - 2 * MARGIN)).rounded())
var scale = 1.0
if side > MAX_SIDE {
  scale = Double(MAX_SIDE) / Double(side)
  side = MAX_SIDE
}
let drawW = Int((Double(cropW) * scale).rounded())
let drawH = Int((Double(cropH) * scale).rounded())

guard
  let canvas = CGContext(
    data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  )
else { fail("could not create canvas") }

canvas.interpolationQuality = .high
canvas.draw(
  cropped,
  in: CGRect(x: (side - drawW) / 2, y: (side - drawH) / 2, width: drawW, height: drawH)
)

guard let output = canvas.makeImage() else { fail("could not compose canvas") }

let rep = NSBitmapImageRep(cgImage: output)
rep.size = NSSize(width: side, height: side)
guard let png = rep.representation(using: .png, properties: [:]) else {
  fail("could not encode png")
}

do {
  try png.write(to: outputURL)
} catch {
  fail("could not write \(outputURL.path): \(error.localizedDescription)")
}

print("\(inputURL.lastPathComponent) -> \(outputURL.lastPathComponent) (\(side)x\(side))")
