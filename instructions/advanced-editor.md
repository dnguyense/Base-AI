# 2.1 - Advanced Photo Editor

## User Story

"Là một power user, tôi muốn có advanced editing tools để fine-tune ảnh sau khi AI đã tạo ra baseline tốt, nhưng vẫn giữ được vintage aesthetic."

## Tổng quan tính năng

Advanced Photo Editor cung cấp comprehensive editing suite với focus vào retro/vintage aesthetics, bao gồm manual adjustments, advanced filters, và creative tools để enhance AI-generated photos.

## Yêu cầu kỹ thuật

### Tech Stack

- **Platform**: Android (Java/Kotlin)
- **Image Processing**: OpenCV cho advanced operations
- **Rendering**: OpenGL ES 3.0 cho real-time preview
- **Gestures**: Custom gesture handling cho precision controls
- **Storage**: Room database cho presets và history
- **Export**: Multiple format support (JPEG, PNG, HEIC)

### Dependencies cần thiết

```gradle
implementation 'org.opencv:opencv-android:4.5.0'
implementation 'androidx.room:room-runtime:2.4.0'
implementation 'com.github.chrisbanes:PhotoView:2.3.0'
implementation 'com.google.android.material:material:1.8.0'
implementation 'androidx.recyclerview:recyclerview:1.3.0'
```

## Yêu cầu chức năng chi tiết

### 1. Core Editing Tools

- **Basic Adjustments**: Exposure, highlights, shadows, contrast, brightness, saturation, warmth
- **Vintage-Specific**: Film grain, vignette, color cast, cross-processing, light leaks
- **Advanced Color**: HSL adjustments, color curves, split toning, color grading
- **Details**: Clarity, texture, dehaze, noise reduction, sharpening
- **Geometry**: Crop, rotate, perspective correction, lens distortion

### 2. Advanced Filter System

- **Non-destructive editing**: Layer-based system
- **Custom presets**: Save và share user-created looks
- **Blend modes**: Multiple, overlay, soft light, color burn, etc.
- **Selective adjustments**: Masking tools cho specific areas
- **History system**: Unlimited undo/redo với branching

### 3. Vintage-Specific Features

- **Film emulation**: Kodak, Fuji, Polaroid stock simulation
- **Light effects**: Lens flares, sunbeams, bokeh overlays
- **Texture overlays**: Paper, fabric, scratches, dust
- **Border styles**: Polaroid frames, film edges, artistic borders
- **Aged effects**: Fading, yellowing, sepia toning

### 4. Professional Tools

- **Precision controls**: Numerical input cho exact values
- **Comparison views**: Before/after, split-screen preview
- **Zoom capabilities**: Up to 100% pixel-level editing
- **Grid overlays**: Rule of thirds, golden ratio, custom grids
- **Color picker**: Eyedropper tool với color analysis

## Components cần triển khai

### 1. `AdvancedEditorActivity.java`

```java
public class AdvancedEditorActivity extends AppCompatActivity {
    private PhotoView imageView;
    private EditingToolsPanel toolsPanel;
    private HistoryManager historyManager;
    private ImageProcessor processor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupImageView();
        initializeEditingTools();
        loadImageForEditing();
    }

    private void setupImageView() {
        // High-resolution image display với zoom/pan
        // Real-time preview của edits
        // Gesture handling cho precision edits
    }
}
```

### 2. `EditingToolsPanel.java`

```java
public class EditingToolsPanel extends LinearLayout {
    private List<EditingTool> tools;
    private EditingToolListener listener;

    public void addTool(EditingTool tool);
    public void setActiveTool(ToolType type);
    public void showToolParameters(EditingTool tool);
    public void updateToolValue(String parameter, float value);

    public interface EditingToolListener {
        void onToolSelected(EditingTool tool);
        void onParameterChanged(String parameter, float value);
        void onToolPresetApplied(ToolPreset preset);
    }
}
```

### 3. `ImageProcessor.java`

```java
public class ImageProcessor {
    private Mat originalImage;
    private Mat workingImage;
    private List<EditingOperation> operations;

    public void loadImage(Bitmap bitmap);
    public void applyOperation(EditingOperation operation);
    public void removeOperation(int index);
    public Bitmap getPreviewImage();
    public Bitmap exportFinalImage(ExportSettings settings);
    public void resetToOriginal();
}
```

### 4. `HistoryManager.java`

```java
public class HistoryManager {
    private Stack<EditingState> undoStack;
    private Stack<EditingState> redoStack;
    private int maxHistorySize = 50;

    public void saveState(EditingState state);
    public EditingState undo();
    public EditingState redo();
    public boolean canUndo();
    public boolean canRedo();
    public void clearHistory();
}
```

## Data Models

### EditingOperation

```java
public class EditingOperation {
    private String operationType; // "exposure", "saturation", etc.
    private Map<String, Float> parameters;
    private boolean isEnabled;
    private BlendMode blendMode;
    private float opacity;
    private Mask mask; // Voor selective edits

    public enum BlendMode {
        NORMAL, MULTIPLY, OVERLAY, SOFT_LIGHT,
        HARD_LIGHT, COLOR_BURN, COLOR_DODGE
    }
}
```

### EditingTool

```java
public class EditingTool {
    private ToolType type;
    private String displayName;
    private List<ToolParameter> parameters;
    private int iconResource;
    private boolean isPremium;

    public enum ToolType {
        BASIC_ADJUSTMENTS, COLOR_GRADING, VINTAGE_EFFECTS,
        DETAILS, GEOMETRY, CREATIVE_FILTERS
    }
}
```

### ToolParameter

```java
public class ToolParameter {
    private String name;
    private String displayName;
    private float minValue;
    private float maxValue;
    private float defaultValue;
    private float currentValue;
    private ParameterType type;

    public enum ParameterType {
        SLIDER, COLOR_PICKER, DROPDOWN, TOGGLE
    }
}
```

### EditingState

```java
public class EditingState {
    private List<EditingOperation> operations;
    private long timestamp;
    private String description; // "Increased exposure +0.5"
    private Bitmap thumbnailPreview; // Small preview cho history
}
```

## UI/UX Implementation

### Main Editor Layout

```xml
<!-- activity_advanced_editor.xml -->
<androidx.constraintlayout.widget.ConstraintLayout>

    <!-- Main image view với zoom/pan support -->
    <com.github.chrisbanes.PhotoView
        android:id="@+id/photo_view"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toTopOf="@+id/tools_panel"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Top toolbar -->
    <androidx.appcompat.widget.Toolbar
        android:id="@+id/toolbar"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        app:layout_constraintTop_toTopOf="parent" />

    <!-- Bottom tools panel -->
    <include layout="@layout/editing_tools_panel"
        android:id="@+id/tools_panel"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        app:layout_constraintBottom_toBottomOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### Tool Parameter Controls

```java
public class ParameterSlider extends View {
    private float minValue, maxValue, currentValue;
    private String parameterName;
    private boolean isPrecisionMode;

    @Override
    protected void onDraw(Canvas canvas) {
        // Custom slider với vintage aesthetic
        // Precise value display
        // Visual feedback cho parameter changes
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        // Handle gesture input
        // Support for precision mode (slow adjustment)
        // Haptic feedback cho major value points
        return super.onTouchEvent(event);
    }
}
```

### Before/After Comparison

```java
public class ComparisonView extends View {
    private Bitmap originalImage;
    private Bitmap editedImage;
    private ComparisonMode mode;
    private float dividerPosition = 0.5f;

    public enum ComparisonMode {
        SIDE_BY_SIDE, VERTICAL_SPLIT, HORIZONTAL_SPLIT,
        OVERLAY_TOGGLE, SLIDE_REVEAL
    }

    @Override
    protected void onDraw(Canvas canvas) {
        switch (mode) {
            case VERTICAL_SPLIT:
                drawVerticalSplit(canvas);
                break;
            case HORIZONTAL_SPLIT:
                drawHorizontalSplit(canvas);
                break;
            // ... other modes
        }
    }
}
```

## Advanced Features Implementation

### Non-Destructive Editing System

```java
public class NonDestructiveEditor {
    private List<EditingLayer> layers;
    private Mat baseImage;

    public void addLayer(EditingLayer layer) {
        layers.add(layer);
        rebuildPreview();
    }

    public void removeLayer(int index) {
        layers.remove(index);
        rebuildPreview();
    }

    private void rebuildPreview() {
        Mat result = baseImage.clone();
        for (EditingLayer layer : layers) {
            if (layer.isEnabled()) {
                result = layer.apply(result);
            }
        }
        updatePreview(result);
    }
}
```

### Selective Editing với Masks

```java
public class MaskingSystem {
    private Mat mask;
    private MaskType type;

    public enum MaskType {
        RADIAL_GRADIENT, LINEAR_GRADIENT, BRUSH_MASK,
        COLOR_RANGE, LUMINANCE_RANGE, CUSTOM_SHAPE
    }

    public Mat createRadialMask(Point center, float innerRadius, float outerRadius) {
        Mat mask = new Mat(imageSize, CvType.CV_8UC1, new Scalar(0));
        // Create gradient từ center với falloff
        return mask;
    }

    public Mat applyMaskedOperation(Mat image, Mat mask, EditingOperation operation) {
        Mat result = image.clone();
        Mat temp = operation.apply(image);

        // Blend original và processed dựa trên mask
        Core.addWeighted(image, 1.0, temp, 1.0, 0.0, result, mask);
        return result;
    }
}
```

### Custom Preset System

```java
public class PresetManager {
    private List<EditingPreset> userPresets;
    private List<EditingPreset> builtInPresets;

    public void savePreset(String name, List<EditingOperation> operations) {
        EditingPreset preset = new EditingPreset(name, operations);
        userPresets.add(preset);
        saveToDatabase(preset);
    }

    public void applyPreset(EditingPreset preset) {
        for (EditingOperation operation : preset.getOperations()) {
            imageProcessor.applyOperation(operation);
        }
    }

    public void sharePreset(EditingPreset preset) {
        // Export preset as JSON
        // Share via intent (email, cloud storage, etc.)
    }
}
```

## Performance Optimization

### Real-time Preview System

```java
public class PreviewManager {
    private Size previewSize = new Size(1080, 1920); // Lower res cho preview
    private Size exportSize; // Full resolution cho export
    private ExecutorService processingExecutor;

    public void updatePreview(EditingOperation operation) {
        processingExecutor.execute(() -> {
            // Apply operation to preview-sized image
            Mat previewResult = processPreviewImage(operation);

            // Update UI on main thread
            handler.post(() -> {
                updateImageView(previewResult);
            });
        });
    }

    public Bitmap exportFullResolution() {
        // Apply all operations to full-size image
        Mat fullResResult = processFullSizeImage();
        return convertMatToBitmap(fullResResult);
    }
}
```

### Memory Management

```java
public class MemoryManager {
    private static final int MAX_PREVIEW_SIZE = 2048;
    private LruCache<String, Mat> operationCache;

    public void optimizeImageSize(Mat image) {
        if (image.width() > MAX_PREVIEW_SIZE || image.height() > MAX_PREVIEW_SIZE) {
            // Resize maintaining aspect ratio
            double scale = Math.min(
                (double) MAX_PREVIEW_SIZE / image.width(),
                (double) MAX_PREVIEW_SIZE / image.height()
            );
            Size newSize = new Size(image.width() * scale, image.height() * scale);
            Imgproc.resize(image, image, newSize);
        }
    }

    public void cleanupUnusedMats() {
        // Release OpenCV Mat objects
        // Clear operation cache
        // Trigger garbage collection if needed
    }
}
```

## Testing Strategy

### Image Processing Tests

```java
@Test
public void testBasicAdjustments() {
    Mat testImage = loadTestImage();

    // Test exposure adjustment
    EditingOperation exposureOp = new EditingOperation("exposure");
    exposureOp.setParameter("value", 0.5f);

    Mat result = imageProcessor.applyOperation(testImage, exposureOp);

    // Verify exposure increased
    Scalar originalMean = Core.mean(testImage);
    Scalar resultMean = Core.mean(result);
    assertTrue(resultMean.val[0] > originalMean.val[0]);
}

@Test
public void testHistorySystem() {
    // Apply multiple operations
    // Test undo/redo functionality
    // Verify state consistency
}
```

### Performance Tests

```java
@Test
public void testRealTimePerformance() {
    Mat testImage = createTestImage(1920, 1080);

    long startTime = System.currentTimeMillis();
    for (int i = 0; i < 30; i++) {
        imageProcessor.applyBasicAdjustment(testImage, "exposure", 0.1f);
    }
    long duration = System.currentTimeMillis() - startTime;

    // Should maintain 30fps preview (33ms per frame)
    assertTrue(duration / 30 < 33);
}
```

## Acceptance Criteria

### Core Functionality

- ✅ Non-destructive editing với unlimited undo/redo
- ✅ Real-time preview với <33ms response time
- ✅ Comprehensive tool set cho retro/vintage aesthetic
- ✅ Custom preset creation và sharing
- ✅ High-quality export trong multiple formats

### User Experience

- ✅ Intuitive interface với professional-grade controls
- ✅ Smooth gesture-based parameter adjustment
- ✅ Before/after comparison modes
- ✅ Precision controls cho exact value input
- ✅ Visual feedback cho all parameter changes

### Performance Requirements

- ✅ Support images up to 50MP resolution
- ✅ Memory usage <500MB cho complex edits
- ✅ Export time <10 seconds cho 12MP images
- ✅ UI remains responsive during processing

### Quality Standards

- ✅ Lossless intermediate processing
- ✅ Professional-grade color accuracy
- ✅ Smooth gradients và transitions
- ✅ Consistent results across devices

## Integration Dependencies

### Required Modules

- **Camera Manager**: Import captured photos
- **Style Profiles**: Apply decade-specific presets
- **Gallery Manager**: Save và organize edited photos
- **Premium Manager**: Advanced tools access control

### Data Flow

1. Import photo → Load into editor
2. Apply AI-generated baseline → Initialize editing state
3. User adjustments → Real-time preview updates
4. Save preset → Store custom settings
5. Export final → High-quality image output
6. Share/save → Gallery integration

## Future Enhancements

- **AI-assisted editing**: Smart suggestions dựa trên image content
- **Cloud sync**: Sync presets và projects across devices
- **Collaboration features**: Share projects với others
- **Advanced masking**: AI-powered object selection
- **RAW support**: Import và process RAW camera files
