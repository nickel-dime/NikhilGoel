// Recentres a transparent PNG on a square canvas, the same way cutout.swift
// frames its Vision cutouts, so AI-generated pieces sit in the grid identically.
//
//   swiftc -O scripts/square.swift -o /tmp/square
//   /tmp/square in.png out.png
//
// Fails if the input has no transparent border to trim, which is how an opaque
// (un-keyed) generation shows up.
import AppKit
import CoreGraphics
import Foundation

let MARGIN = 0.06
let MAX_SIDE = 1600

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data("error: \(message)\n".utf8))
  exit(1)
}

let args = CommandLine.arguments
guard args.count == 3 else { fail("usage: square <input.png> <output.png>") }
let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard let source = NSImage(contentsOf: inputURL),
  let cgImage = source.cgImage(forProposedRect: nil, context: nil, hints: nil)
else { fail("could not read \(inputURL.lastPathComponent)") }

let width = cgImage.width
let height = cgImage.height
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

var minX = width, minY = height, maxX = -1, maxY = -1
for y in 0..<height {
  for x in 0..<width where pixels[(y * width + x) * 4 + 3] > 2 {
    if x < minX { minX = x }
    if x > maxX { maxX = x }
    if y < minY { minY = y }
    if y > maxY { maxY = y }
  }
}
guard maxX >= minX else { fail("\(inputURL.lastPathComponent) is fully transparent") }
guard minX > 0 || minY > 0 || maxX < width - 1 || maxY < height - 1 else {
  fail("\(inputURL.lastPathComponent) has no transparent background")
}

let cropW = maxX - minX + 1
let cropH = maxY - minY + 1
guard
  let full = CGContext(
    data: &pixels, width: width, height: height, bitsPerComponent: 8,
    bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  )?.makeImage(),
  let cropped = full.cropping(to: CGRect(x: minX, y: minY, width: cropW, height: cropH))
else { fail("could not crop") }

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
  in: CGRect(x: (side - drawW) / 2, y: (side - drawH) / 2, width: drawW, height: drawH))

guard let out = canvas.makeImage() else { fail("could not render canvas") }
let rep = NSBitmapImageRep(cgImage: out)
guard let png = rep.representation(using: .png, properties: [:]) else {
  fail("could not encode PNG")
}
do {
  try png.write(to: outputURL)
} catch {
  fail("could not write \(outputURL.path): \(error.localizedDescription)")
}
print("\(inputURL.lastPathComponent) -> \(outputURL.lastPathComponent) (\(side)x\(side))")
