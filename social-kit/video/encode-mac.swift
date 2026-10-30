// Encoder ohne ffmpeg – nutzt nur macOS-Bordmittel (AVFoundation + ImageIO).
// Wird von encode.sh verwendet, wenn kein ffmpeg installiert ist.
//
//   swiftc -O encode-mac.swift -o /tmp/encode-mac
//   /tmp/encode-mac mp4   <framesDir> <out.mp4> <fps> [bitrate] [srcFps] -> H.264 (High), 4:2:0, moov vorne (faststart)
//        srcFps < fps: jedes Bild wird wiederholt (z.B. 15-fps-Frames -> 30-fps-Video)
//   /tmp/encode-mac gif   <framesDir> <out.gif> <srcFps> <gifFps> <width>
//   /tmp/encode-mac probe <file.mp4>                              -> Dauer, Auflösung, fps, Codec
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

func die(_ msg: String) -> Never { FileHandle.standardError.write((msg + "\n").data(using: .utf8)!); exit(1) }

func frameFiles(_ dir: String) -> [URL] {
    let fm = FileManager.default
    guard let names = try? fm.contentsOfDirectory(atPath: dir) else { die("Ordner fehlt: \(dir)") }
    let pngs = names.filter { $0.hasPrefix("f") && $0.hasSuffix(".png") }.sorted()
    if pngs.isEmpty { die("Keine Frames in \(dir)") }
    return pngs.map { URL(fileURLWithPath: dir).appendingPathComponent($0) }
}

func loadImage(_ url: URL) -> CGImage {
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { die("Kann nicht lesen: \(url.path)") }
    return img
}

func encodeMP4(dir: String, out: String, fps: Int32, bitrate: Int, srcFps: Int32) {
    let rep = max(1, Int(fps / srcFps))
    let files = frameFiles(dir)
    let first = loadImage(files[0])
    let w = first.width, h = first.height
    let outURL = URL(fileURLWithPath: out)
    try? FileManager.default.removeItem(at: outURL)
    guard let writer = try? AVAssetWriter(outputURL: outURL, fileType: .mp4) else { die("AVAssetWriter fehlgeschlagen") }
    writer.shouldOptimizeForNetworkUse = true // entspricht -movflags +faststart
    let settings: [String: Any] = [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: w, AVVideoHeightKey: h,
        AVVideoCompressionPropertiesKey: [
            AVVideoAverageBitRateKey: bitrate,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
            AVVideoExpectedSourceFrameRateKey: Int(fps),
            AVVideoAllowFrameReorderingKey: true,
        ],
        AVVideoColorPropertiesKey: [
            AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
            AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
            AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
        ],
    ]
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
    input.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: w, kCVPixelBufferHeightKey as String: h,
    ])
    writer.add(input)
    if !writer.startWriting() { die("startWriting fehlgeschlagen: \(String(describing: writer.error))") }
    writer.startSession(atSourceTime: .zero)
    let cs = CGColorSpace(name: CGColorSpace.sRGB)!
    for (i, f) in files.enumerated() {
        autoreleasepool {
            let img = i == 0 ? first : loadImage(f)
            while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
            var pbOpt: CVPixelBuffer?
            if let pool = adaptor.pixelBufferPool { CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pbOpt) }
            else { CVPixelBufferCreate(nil, w, h, kCVPixelFormatType_32BGRA, nil, &pbOpt) }
            guard let pb = pbOpt else { die("PixelBuffer fehlgeschlagen") }
            CVPixelBufferLockBaseAddress(pb, [])
            let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb), width: w, height: h, bitsPerComponent: 8,
                                bytesPerRow: CVPixelBufferGetBytesPerRow(pb), space: cs,
                                bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
            ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
            CVPixelBufferUnlockBaseAddress(pb, [])
            for r in 0..<rep {
                while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
                if !adaptor.append(pb, withPresentationTime: CMTime(value: CMTimeValue(i * rep + r), timescale: fps)) {
                    die("append fehlgeschlagen bei Frame \(i): \(String(describing: writer.error))")
                }
            }
        }
    }
    input.markAsFinished()
    let sem = DispatchSemaphore(value: 0)
    writer.finishWriting { sem.signal() }
    sem.wait()
    if writer.status != .completed { die("Encoding fehlgeschlagen: \(String(describing: writer.error))") }
    print("OK \(out): \(files.count) Quellbilder x\(rep), \(w)x\(h) @ \(fps) fps")
}

func encodeGIF(dir: String, out: String, srcFps: Int, gifFps: Int, width: Int) {
    let all = frameFiles(dir)
    let step = max(1, srcFps / gifFps)
    let files = stride(from: 0, to: all.count, by: step).map { all[$0] }
    let first = loadImage(files[0])
    let h = Int((Double(first.height) * Double(width) / Double(first.width)).rounded())
    let outURL = URL(fileURLWithPath: out)
    guard let dest = CGImageDestinationCreateWithURL(outURL as CFURL, UTType.gif.identifier as CFString, files.count, nil) else { die("GIF-Ziel fehlgeschlagen") }
    CGImageDestinationSetProperties(dest, [kCGImagePropertyGIFDictionary: [kCGImagePropertyGIFLoopCount: 0]] as CFDictionary)
    let delay = 1.0 / Double(gifFps)
    let frameProps = [kCGImagePropertyGIFDictionary: [kCGImagePropertyGIFDelayTime: delay, kCGImagePropertyGIFUnclampedDelayTime: delay]] as CFDictionary
    let cs = CGColorSpace(name: CGColorSpace.sRGB)!
    for f in files {
        autoreleasepool {
            let img = loadImage(f)
            let ctx = CGContext(data: nil, width: width, height: h, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                                bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
            ctx.interpolationQuality = .high
            ctx.draw(img, in: CGRect(x: 0, y: 0, width: width, height: h))
            CGImageDestinationAddImage(dest, ctx.makeImage()!, frameProps)
        }
    }
    if !CGImageDestinationFinalize(dest) { die("GIF schreiben fehlgeschlagen") }
    print("OK \(out): \(files.count) Frames, \(width)x\(h) @ \(gifFps) fps")
}

func probe(_ path: String) {
    let asset = AVURLAsset(url: URL(fileURLWithPath: path))
    let sem = DispatchSemaphore(value: 0)
    Task {
        do {
            let dur = try await asset.load(.duration)
            guard let track = try await asset.loadTracks(withMediaType: .video).first else { die("Keine Videospur") }
            let size = try await track.load(.naturalSize)
            let fps = try await track.load(.nominalFrameRate)
            let fmts = try await track.load(.formatDescriptions)
            let codec = fmts.first.map { CMFormatDescriptionGetMediaSubType($0) } ?? 0
            let c = String(bytes: [24, 16, 8, 0].map { UInt8((codec >> $0) & 0xff) }, encoding: .ascii) ?? "?"
            let audio = try await asset.loadTracks(withMediaType: .audio).count
            print(String(format: "%@: Dauer %.3f s, %dx%d, %.2f fps, Codec %@, Audiospuren %d",
                         (path as NSString).lastPathComponent, dur.seconds, Int(size.width), Int(size.height), fps, c, audio))
        } catch { die("probe: \(error)") }
        sem.signal()
    }
    sem.wait()
}

let a = CommandLine.arguments
guard a.count >= 3 else { die("Aufruf: mp4|gif|probe ...") }
switch a[1] {
case "mp4": encodeMP4(dir: a[2], out: a[3], fps: Int32(a[4]) ?? 30, bitrate: a.count > 5 ? Int(a[5])! : 8_000_000, srcFps: a.count > 6 ? Int32(a[6])! : (Int32(a[4]) ?? 30))
case "gif": encodeGIF(dir: a[2], out: a[3], srcFps: Int(a[4])!, gifFps: Int(a[5])!, width: Int(a[6])!)
case "probe": probe(a[2])
default: die("Unbekannter Modus \(a[1])")
}
