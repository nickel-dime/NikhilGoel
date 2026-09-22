// Turns a photo of a garment into a square transparent-PNG cutout, using the
// Vision subject-lifting model that ships with macOS. No GUI, no network.
//
//   swiftc -O scripts/cutout.swift -o /tmp/cutout
//   /tmp/cutout in.jpg out.png
//
// The subject is cropped to its own extent and then centred on a square canvas
// with a consistent margin, so every piece sits the same way in the grid no
// matter how the photo was framed.
import AppKit
import CoreImage
import Foundation
import Vision

let MARGIN = 0.06 // fraction of the canvas left empty on the tightest side

func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data("error: \(message)\n".utf8))
  exit(1)
}

let args = CommandLine.arguments
guard args.count == 3 else { fail("usage: cutout <input> <output.png>") }
let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard let source = NSImage(contentsOf: inputURL),
  let cgImage = source.cgImage(forProposedRect: nil, context: nil, hints: nil)
else { fail("could not read \(inputURL.lastPathComponent)") }

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

let masked: CVPixelBuffer
do {
  masked = try result.generateMaskedImage(
    ofInstances: result.allInstances,
    from: handler,
    croppedToInstancesExtent: true
  )
} catch {
  fail("could not mask \(inputURL.lastPathComponent): \(error.localizedDescription)")
}

let ciImage = CIImage(cvPixelBuffer: masked)
let ciContext = CIContext()
guard let cropped = ciContext.createCGImage(ciImage, from: ciImage.extent) else {
  fail("could not rasterise mask")
}

// Centre the cutout on a square canvas, scaled to leave MARGIN on the long side.
let side = Int((Double(max(cropped.width, cropped.height)) / (1 - 2 * MARGIN)).rounded())
guard
  let context = CGContext(
    data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  )
else { fail("could not create canvas") }

context.interpolationQuality = .high
context.draw(
  cropped,
  in: CGRect(
    x: (side - cropped.width) / 2,
    y: (side - cropped.height) / 2,
    width: cropped.width,
    height: cropped.height
  )
)

guard let output = context.makeImage() else { fail("could not compose canvas") }

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
