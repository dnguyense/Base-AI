import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // App Logo/Title
                VStack(spacing: 10) {
                    Image(systemName: "camera.vintage")
                        .font(.system(size: 80))
                        .foregroundColor(.orange)
                    
                    Text("VintageVibe")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("Capture Yesterday's Soul with Tomorrow's Intelligence")
                        .font(.caption)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                
                Spacer()
                
                // Main Action Buttons
                VStack(spacing: 20) {
                    NavigationLink(destination: CameraView()) {
                        HStack {
                            Image(systemName: "camera")
                            Text("Start Capturing")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange)
                        .foregroundColor(.black)
                        .cornerRadius(12)
                        .font(.headline)
                    }
                    
                    NavigationLink(destination: GalleryView()) {
                        HStack {
                            Image(systemName: "photo.on.rectangle")
                            Text("My Vintage Gallery")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.clear)
                        .foregroundColor(.orange)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.orange, lineWidth: 2)
                        )
                        .font(.headline)
                    }
                }
                .padding(.horizontal, 30)
                
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black)
        }
        .navigationBarHidden(true)
    }
}

// Placeholder views for navigation
struct CameraView: View {
    var body: some View {
        Text("Camera View - Coming Soon!")
            .foregroundColor(.white)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black)
    }
}

struct GalleryView: View {
    var body: some View {
        Text("Gallery View - Coming Soon!")
            .foregroundColor(.white)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black)
    }
}

#Preview {
    ContentView()
} 