import Foundation
import UIKit
import React

@objc(MapSnapshotHelper)
class MapSnapshotHelper: NSObject {
  @objc
  func createSnapshot(_ cameraState: NSDictionary, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let latitude = cameraState["latitude"] as? Double,
          let longitude = cameraState["longitude"] as? Double,
          let width = cameraState["width"] as? CGFloat,
          let height = cameraState["height"] as? CGFloat else {
      reject("invalid_args", "Camera state missing required fields", nil)
      return
    }

    let renderer = UIGraphicsImageRenderer(size: CGSize(width: width, height: height))
    let image = renderer.image { context in
      UIColor.systemGray.setFill()
      context.fill(CGRect(origin: .zero, size: CGSize(width: width, height: height)))
      let text = "Snapshot @\n\(latitude), \(longitude)"
      let attributes: [NSAttributedString.Key: Any] = [
        .foregroundColor: UIColor.white,
        .font: UIFont.systemFont(ofSize: 18, weight: .semibold)
      ]
      text.draw(in: CGRect(x: 14, y: 14, width: width - 28, height: height - 28), withAttributes: attributes)
    }

    guard let data = image.pngData() else {
      reject("snapshot_failed", "Unable to encode snapshot image", nil)
      return
    }

    let fileName = "snapshot_\(UUID().uuidString).png"
    let url = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)

    do {
      try data.write(to: url)
      resolve(url.absoluteString)
    } catch {
      reject("save_failed", error.localizedDescription, error)
    }
  }

  @objc
  func saveSnapshot(_ data: NSDictionary, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let path = data["path"] as? String else {
      reject("invalid_args", "Path required", nil)
      return
    }
    let fileURL = URL(fileURLWithPath: path)
    if FileManager.default.fileExists(atPath: fileURL.path) {
      resolve(fileURL.absoluteString)
    } else {
      reject("not_found", "Snapshot file not found", nil)
    }
  }

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
