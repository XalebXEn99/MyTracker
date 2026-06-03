import Foundation
import AVFoundation
import CoreBluetooth
import React

@objc(CarConnectionManager)
class CarConnectionManager: RCTEventEmitter, CBCentralManagerDelegate {
  private var centralManager: CBCentralManager!
  private var connectedAccessories: [String] = []

  override init() {
    super.init()
    centralManager = CBCentralManager(delegate: self, queue: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(routeChanged(_:)), name: AVAudioSession.routeChangeNotification, object: nil)
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    return ["CarDidConnect"]
  }

  @objc
  func getConnectedAccessories(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(connectedAccessories)
  }

  @objc
  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    if central.state == .poweredOn {
      central.scanForPeripherals(withServices: nil, options: nil)
    }
  }

  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    let name = peripheral.name ?? "Unknown"
    if name.range(of: "Toyota", options: .caseInsensitive) != nil || name.range(of: "Corolla", options: .caseInsensitive) != nil {
      connectedAccessories.append(name)
      sendEvent(withName: "CarDidConnect", body: ["deviceName": name, "connected": true])
    }
  }

  @objc
  func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    if let name = peripheral.name,
       (name.range(of: "Toyota", options: .caseInsensitive) != nil || name.range(of: "Corolla", options: .caseInsensitive) != nil) {
      central.connect(peripheral, options: nil)
    }
  }

  @objc
  func routeChanged(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
          let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else {
      return
    }
    if reason == .newDeviceAvailable || reason == .oldDeviceUnavailable {
      let session = AVAudioSession.sharedInstance()
      let outputs = session.currentRoute.outputs
      outputs.forEach { output in
        let name = output.portName
        if name.range(of: "Toyota", options: .caseInsensitive) != nil || name.range(of: "Corolla", options: .caseInsensitive) != nil {
          connectedAccessories.append(name)
          sendEvent(withName: "CarDidConnect", body: ["deviceName": name, "connected": true])
        }
      }
    }
  }
}
