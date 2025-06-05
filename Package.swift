// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "VintageVibe",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "VintageVibe",
            targets: ["VintageVibe"]
        ),
    ],
    dependencies: [
        // Supabase iOS SDK for backend services
        .package(url: "https://github.com/supabase/supabase-swift", from: "2.5.0"),
        
        // Additional ML/AI libraries if needed
        .package(url: "https://github.com/tensorflow/swift-models", branch: "main"),
        
        // Image processing utilities
        .package(url: "https://github.com/onevcat/Kingfisher", from: "7.9.0"),
        
        // Social sharing enhancements
        .package(url: "https://github.com/SocialNetwork/SocialShare", from: "1.0.0"),
    ],
    targets: [
        .target(
            name: "VintageVibe",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "Kingfisher", package: "Kingfisher"),
            ],
            resources: [
                .process("ML Models"),
                .process("Resources")
            ]
        ),
        .testTarget(
            name: "VintageVibeTests",
            dependencies: ["VintageVibe"]
        ),
    ]
) 