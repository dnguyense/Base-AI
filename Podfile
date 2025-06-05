# Uncomment the next line to define a global platform for your project
platform :ios, '17.0'

target 'VintageVibe' do
  # Comment the next line if you don't want to use dynamic frameworks
  use_frameworks!

  # Core functionality
  pod 'Supabase', '~> 2.5.0'
  
  # Camera and image processing
  pod 'GPUImage2', '~> 3.0'
  pod 'Kingfisher', '~> 7.9.0'
  
  # UI enhancements
  pod 'SnapKit', '~> 5.6.0'
  pod 'lottie-ios', '~> 4.3.0'
  
  # Social sharing
  pod 'FBSDKShareKit', '~> 17.0'
  
  # Analytics (optional)
  pod 'Firebase/Analytics'
  pod 'Firebase/Crashlytics'

  target 'VintageVibeTests' do
    inherit! :search_paths
    # Pods for testing
  end

  target 'VintageVibeUITests' do
    # Pods for testing
  end
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '17.0'
    end
  end
end 