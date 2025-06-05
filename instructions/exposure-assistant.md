# 1.3 - Smart Exposure Assistant

## User Story

"Là một user không hiểu về camera settings, tôi muốn ảnh luôn có exposure hoàn hảo mà không cần adjust manual."

## Tổng quan tính năng

Smart Exposure Assistant tự động phân tích histogram và điều chỉnh exposure settings để đảm bảo ảnh có exposure tối ưu, đặc biệt tối ưu cho aesthetic retro với slight overexposure.

## Yêu cầu kỹ thuật

### Tech Stack

- **Platform**: Android (Java/Kotlin)
- **Camera**: Camera2 API với manual exposure control
- **Image Analysis**: Histogram calculation và luminance analysis
- **Face Detection**: ML Kit Face Detection cho face priority exposure
- **HDR**: Camera2 HDR+ integration

### Dependencies cần thiết

```gradle
implementation 'androidx.camera:camera-camera2:1.3.0'
implementation 'androidx.camera:camera-lifecycle:1.3.0'
implementation 'com.google.mlkit:face-detection:16.1.5'
implementation 'org.opencv:opencv-android:4.5.0'
```

## Yêu cầu chức năng chi tiết

### 1. Real-time Histogram Analysis

- **Input**: Camera preview frames (YUV format)
- **Processing**: Calculate luminance histogram 0-255
- **Detection**: Identify overexposure (>240) và underexposure (<15)
- **Frequency**: Analyze mỗi frame (30fps) với efficient algorithms

### 2. Auto Exposure Compensation

- **Range**: ±2 stops compensation
- **Algorithm**: PID controller cho smooth adjustments
- **Speed**: Gradual changes để tránh jarring transitions
- **Override**: User có thể manual override khi needed

### 3. HDR Smart Trigger

- **Condition**: High contrast scenes (dynamic range >8 stops)
- **Auto-enable**: Tự động kích hoạt HDR mode
- **Processing**: Merge multiple exposures for optimal result
- **Fallback**: Single exposure nếu HDR processing fails

### 4. Face Priority Exposure

- **Detection**: ML Kit face detection trong preview
- **Priority**: Ensure faces properly exposed (luminance 100-180)
- **Multi-face**: Average exposure cho multiple faces
- **Weighting**: Face regions có priority cao hơn background

### 5. Vintage Film Aesthetic

- **Style**: Slight overexposure (+0.3 stops) cho film look
- **Grain**: Compensate exposure để preserve film grain
- **Highlights**: Protect highlights while lifting shadows
- **Color**: Optimize exposure cho vintage color grading

## Components cần triển khai

### 1. `SmartExposureIndicator.java`

```java
public class SmartExposureIndicator extends View {
    private Paint exposurePaint;
    private float currentExposure; // -2.0 to +2.0
    private ExposureState state;
    private boolean isOptimizing;

    @Override
    protected void onDraw(Canvas canvas) {
        // Draw exposure meter với color coding
        // Show "Auto-Perfect" badge khi optimized
        // Animate exposure changes smoothly
    }
}
```

### 2. `ExposureAnalysisEngine.java`

```java
public class ExposureAnalysisEngine {
    public HistogramData analyzeFrame(Image frame);
    public float calculateOptimalExposure(HistogramData histogram,
                                        List<Face> faces);
    public boolean shouldEnableHDR(HistogramData histogram);
    public ExposureRecommendation getRecommendation(AnalysisResult result);
}
```

### 3. `CameraExposureController.java`

```java
public class CameraExposureController {
    private CameraDevice camera;
    private CaptureRequest.Builder requestBuilder;

    public void setExposureCompensation(float value);
    public void enableHDR(boolean enable);
    public void setManualOverride(boolean manual);
    public ExposureSettings getCurrentSettings();
}
```

## Data Models

### HistogramData

```java
public class HistogramData {
    private int[] luminanceHistogram; // 256 bins
    private float averageLuminance;
    private float dynamicRange;
    private int overexposedPixels; // >240
    private int underexposedPixels; // <15
    private long analysisTimestamp;
}
```

### ExposureSettings

```java
public class ExposureSettings {
    private float exposureCompensation; // ±2 stops
    private boolean hdrEnabled;
    private boolean manualOverride;
    private List<Face> priorityFaces;
    private float confidenceScore;

    public enum ExposureQuality {
        UNDEREXPOSED, OPTIMAL, OVEREXPOSED, HDR_RECOMMENDED
    }
}
```

### ExposureRecommendation

```java
public class ExposureRecommendation {
    private float recommendedCompensation;
    private boolean enableHDR;
    private String reasonText; // "Face too dark", "Sky blown out"
    private float confidence;
    private VintageAdjustment vintageSettings;
}
```

## UI/UX Implementation

### Visual Elements

- **Exposure Meter**: Vertical bar bên side của screen
- **Color Coding**:
  - Blue: Underexposed (<-1 stop)
  - Green: Optimal (-1 to +1 stop)
  - Orange: Overexposed (>+1 stop)
- **Auto Badge**: "Auto-Perfect" badge khi AI optimizing
- **Manual Override**: Tap meter để switch to manual mode

### Animation System

```java
// Smooth exposure transitions
ValueAnimator exposureAnimator = ValueAnimator.ofFloat(currentValue, targetValue);
exposureAnimator.setDuration(300);
exposureAnimator.setInterpolator(new DecelerateInterpolator());

// Success indicator animation
ObjectAnimator successBadge = ObjectAnimator.ofFloat(badge, "alpha", 0f, 1f);
successBadge.setDuration(200);
```

### State Management

```java
public enum ExposureState {
    ANALYZING,     // Calculating optimal exposure
    OPTIMIZING,    // Applying exposure adjustments
    OPTIMIZED,     // "✓ Optimized" indicator
    MANUAL,        // User manual override active
    HDR_PROCESSING // HDR mode active
}
```

## Advanced Algorithms

### 1. PID Exposure Controller

```java
public class ExposurePIDController {
    private float kP = 0.8f; // Proportional gain
    private float kI = 0.1f; // Integral gain
    private float kD = 0.2f; // Derivative gain

    private float previousError = 0f;
    private float integral = 0f;

    public float calculate(float targetExposure, float currentExposure, float deltaTime) {
        float error = targetExposure - currentExposure;
        integral += error * deltaTime;
        float derivative = (error - previousError) / deltaTime;

        float output = kP * error + kI * integral + kD * derivative;
        previousError = error;

        return MathUtils.clamp(output, -2.0f, 2.0f);
    }
}
```

### 2. Multi-Region Metering

```java
public float calculateWeightedExposure(HistogramData histogram, List<Face> faces, Size frameSize) {
    float faceWeight = 0.7f;
    float backgroundWeight = 0.3f;

    // Calculate face region exposure
    float faceExposure = calculateFaceExposure(faces, frameSize);

    // Calculate background exposure
    float backgroundExposure = histogram.averageLuminance / 255.0f;

    // Weighted combination
    return faceExposure * faceWeight + backgroundExposure * backgroundWeight;
}
```

### 3. Vintage Film Simulation

```java
public ExposureSettings applyVintageAesthetic(ExposureSettings baseSettings) {
    // Slight overexposure for film look
    baseSettings.exposureCompensation += 0.3f;

    // Preserve highlight detail
    if (baseSettings.exposureCompensation > 1.5f) {
        baseSettings.hdrEnabled = true;
    }

    // Adjust for film grain preservation
    if (baseSettings.exposureCompensation < -0.5f) {
        baseSettings.exposureCompensation = Math.max(-0.5f, baseSettings.exposureCompensation);
    }

    return baseSettings;
}
```

## Performance Optimization

### Efficient Histogram Calculation

```java
// Use RenderScript for fast histogram computation
private RenderScript rs;
private ScriptIntrinsicHistogram histogramScript;

public int[] calculateHistogram(Bitmap bitmap) {
    Allocation input = Allocation.createFromBitmap(rs, bitmap);
    Allocation output = Allocation.createSized(rs, Element.I32(rs), 256);

    histogramScript.setOutput(output);
    histogramScript.forEach(input);

    int[] histogram = new int[256];
    output.copyTo(histogram);

    return histogram;
}
```

### Memory Management

- **Bitmap recycling**: Reuse bitmap objects
- **Background processing**: Use HandlerThread cho analysis
- **Result caching**: Cache recent analysis results
- **Garbage collection**: Minimize object allocations

## Testing Strategy

### Unit Tests

```java
@Test
public void testExposureCalculation() {
    // Test optimal exposure calculation
    // Verify PID controller stability
    // Validate histogram analysis accuracy
}

@Test
public void testHDRTrigger() {
    // Test high contrast scene detection
    // Verify HDR enable/disable logic
    // Test fallback scenarios
}
```

### Integration Tests

- Camera2 API integration
- Face detection accuracy
- Real-time performance testing
- Battery usage measurement

### Visual Tests

- Exposure accuracy validation
- HDR processing quality
- UI animation smoothness
- Color accuracy testing

## Acceptance Criteria

### Core Functionality

- ✅ Real-time histogram analysis và auto-exposure adjustment
- ✅ Auto-enable HDR cho high contrast scenes
- ✅ Face priority exposure để protect subject faces
- ✅ Manual override option khi user tap exposure meter
- ✅ Visual feedback với color-coded exposure indicator

### Performance Requirements

- ✅ <16ms histogram calculation per frame
- ✅ Smooth exposure transitions <300ms
- ✅ No frame drops trong camera preview
- ✅ Memory usage <30MB additional

### Vintage Aesthetic

- ✅ Slight overexposure (+0.3 stops) cho film look
- ✅ Preserve film grain trong low light
- ✅ Optimal exposure cho retro color grading
- ✅ Highlight protection trong bright scenes

## Error Handling

### Camera API Errors

- **Exposure not supported**: Fallback to basic auto-exposure
- **HDR unavailable**: Continue với single exposure
- **Manual control failed**: Reset to camera default

### Processing Errors

- **Histogram calculation failed**: Use previous frame data
- **Face detection timeout**: Use center-weighted metering
- **Memory pressure**: Reduce analysis frequency

## Integration Dependencies

### Required Modules

- **Camera Manager**: Access to Camera2 API controls
- **Face Detection**: ML Kit integration
- **Style Engine**: Coordinate exposure với filter requirements
- **Settings**: User preferences cho exposure behavior

### Data Flow

1. Camera preview frame → Histogram analysis
2. Face detection results → Priority weighting
3. Exposure calculation → Camera2 controls
4. Visual feedback → UI updates
5. User interaction → Manual override

## Future Enhancements

- **Advanced metering modes**: Spot, center-weighted, matrix
- **Scene-specific exposure**: Optimize cho different retro styles
- **Learning algorithm**: Adapt to user preferences over time
- **Professional controls**: ISO, shutter speed manual override
- **Bracketing support**: Multiple exposures cho advanced HDR
