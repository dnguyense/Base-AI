# 1.4 - Decade-Specific Style Profiles

## User Story

"Là một creative content creator, tôi muốn easily switch between different vintage eras để create themed content consistent với mood tôi muốn express."

## Tổng quan tính năng

Decade-Specific Style Profiles cung cấp bộ sưu tập filters và effects được thiết kế chính xác theo từng thập kỷ (60s, 70s, 80s, 90s, Y2K), mỗi era có 3-4 variations để phù hợp với different moods và lighting conditions.

## Yêu cầu kỹ thuật

### Tech Stack

- **Platform**: Android (Java/Kotlin)
- **Image Processing**: OpenGL ES 2.0 cho real-time filters
- **Shaders**: GLSL shaders cho color grading và effects
- **Storage**: SQLite cho style metadata và preferences
- **Premium**: Google Play Billing cho premium styles

### Dependencies cần thiết

```gradle
implementation 'org.opencv:opencv-android:4.5.0'
implementation 'com.android.billingclient:billing:5.0.0'
implementation 'androidx.room:room-runtime:2.4.0'
implementation 'com.squareup.picasso:picasso:2.8'
```

## Yêu cầu chức năng chi tiết

### 1. Core Decade Styles

- **1960s**: Classic film, high contrast, saturated colors
- **1970s**: Warm tones, golden hour aesthetic, soft focus
- **1980s**: Neon colors, high saturation, dramatic shadows
- **1990s**: Cool tones, muted colors, grunge aesthetic
- **Y2K (2000s)**: Digital artifacts, chrome effects, futuristic feel

### 2. Style Variations per Decade

Mỗi decade có 4 sub-variations:

- **Bright**: High contrast, vivid colors, sharp details
- **Moody**: Low key lighting, dramatic shadows, film noir
- **Faded**: Vintage fade, reduced saturation, aged look
- **Classic**: Authentic period-correct color grading

### 3. Real-time Preview System

- **Live preview**: Apply filters to camera viewfinder
- **Performance**: Maintain 30fps camera preview
- **Thumbnail generation**: Create style previews cho UI
- **Adaptive quality**: Lower quality cho older devices

### 4. Premium Monetization

- **Free styles**: 2 variations per decade (10 total)
- **Premium styles**: Additional 2 variations per decade (10 more)
- **Subscription model**: Unlock all premium styles
- **Trial period**: 7 days free access to all styles

## Components cần triển khai

### 1. `DecadeStyleCarousel.java`

```java
public class DecadeStyleCarousel extends RecyclerView {
    private StyleAdapter adapter;
    private List<StyleCategory> decades;
    private StyleSelectionListener listener;

    public void setSelectedDecade(DecadeType decade);
    public void showSubVariations(StyleCategory category);
    public void updatePremiumStatus(boolean isPremium);

    public interface StyleSelectionListener {
        void onStyleSelected(Style style);
        void onPremiumStyleRequested(Style style);
    }
}
```

### 2. `StyleRenderEngine.java`

```java
public class StyleRenderEngine {
    private GLSurfaceView glSurfaceView;
    private HashMap<String, StyleShader> shaderCache;

    public void applyStyle(Style style, Bitmap inputFrame);
    public Bitmap generatePreviewThumbnail(Style style, Bitmap sample);
    public void preloadStyleShaders(List<Style> styles);
    public void releaseResources();
}
```

### 3. `StyleShader.java`

```java
public class StyleShader {
    private int programId;
    private int vertexShaderId;
    private int fragmentShaderId;

    // Decade-specific shader uniforms
    private int uColorMatrix;
    private int uFilmGrain;
    private int uVignette;
    private int uContrast;
    private int uSaturation;

    public void loadShaderFromAssets(String vertexPath, String fragmentPath);
    public void setDecadeParameters(DecadeType decade, VariationType variation);
    public void render(Texture inputTexture);
}
```

## Data Models

### Style Definitions

```java
public class Style {
    private String styleId;
    private DecadeType decade;
    private VariationType variation;
    private String displayName; // "Groovy 70s", "Neon 80s"
    private boolean isPremium;
    private int usageCount;
    private StyleParameters parameters;

    public enum DecadeType {
        SIXTIES("60s"), SEVENTIES("70s"), EIGHTIES("80s"),
        NINETIES("90s"), Y2K("Y2K");
    }

    public enum VariationType {
        BRIGHT, MOODY, FADED, CLASSIC
    }
}
```

### StyleParameters

```java
public class StyleParameters {
    // Color grading
    private float[] colorMatrix; // 4x4 matrix
    private float contrast;
    private float saturation;
    private float brightness;
    private float warmth;

    // Film simulation
    private float filmGrainIntensity;
    private FilmType filmStock;
    private float vignetteStrength;

    // Era-specific effects
    private boolean chromaShift; // 80s digital artifacts
    private float lightsBloom;   // 70s soft glow
    private boolean crossProcess; // 90s alternative processing
}
```

### StyleCategory

```java
public class StyleCategory {
    private DecadeType decade;
    private String displayName;
    private String description;
    private int iconResource;
    private List<Style> variations;
    private boolean hasLockedStyles;

    public List<Style> getFreeStyles();
    public List<Style> getPremiumStyles();
    public Style getRecommendedStyle();
}
```

## Shader Implementation

### Base Vertex Shader

```glsl
// assets/shaders/vintage_vertex.glsl
attribute vec4 aPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

void main() {
    gl_Position = aPosition;
    vTextureCoord = aTextureCoord;
}
```

### 1970s Fragment Shader Example

```glsl
// assets/shaders/seventies_fragment.glsl
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform mat4 uColorMatrix;
uniform float uWarmth;
uniform float uFilmGrain;
uniform float uVignette;

// Film grain noise function
float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 color = texture2D(uTexture, vTextureCoord);

    // Apply 70s warm color grading
    color = uColorMatrix * color;

    // Add warmth (orange/yellow tint)
    color.r = mix(color.r, color.r * 1.1, uWarmth);
    color.g = mix(color.g, color.g * 1.05, uWarmth);

    // Film grain simulation
    float grain = random(vTextureCoord) * uFilmGrain;
    color.rgb += vec3(grain);

    // Vignette effect (darker edges)
    vec2 center = vTextureCoord - 0.5;
    float vignette = 1.0 - dot(center, center) * uVignette;
    color.rgb *= vignette;

    gl_FragColor = color;
}
```

### 1980s Neon Shader

```glsl
// assets/shaders/eighties_fragment.glsl
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float uNeonIntensity;
uniform float uChromaticAberration;

void main() {
    vec4 color = texture2D(uTexture, vTextureCoord);

    // Chromatic aberration effect
    vec2 offset = vec2(uChromaticAberration * 0.01);
    color.r = texture2D(uTexture, vTextureCoord + offset).r;
    color.b = texture2D(uTexture, vTextureCoord - offset).b;

    // Boost saturation and contrast (80s look)
    color.rgb = (color.rgb - 0.5) * 1.3 + 0.5; // Contrast
    color.rgb = mix(vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114))), color.rgb, 1.4); // Saturation

    // Add neon glow to bright areas
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    if (luminance > 0.7) {
        color.rgb += vec3(0.2, 0.1, 0.4) * uNeonIntensity;
    }

    gl_FragColor = color;
}
```

## UI/UX Implementation

### Carousel Design

```java
public class StyleCarouselAdapter extends RecyclerView.Adapter<StyleViewHolder> {
    @Override
    public void onBindViewHolder(StyleViewHolder holder, int position) {
        StyleCategory category = decades.get(position);

        // Set decade thumbnail với style preview
        holder.thumbnailImageView.setImageBitmap(
            styleEngine.generatePreviewThumbnail(category.getRecommendedStyle(), sampleFrame)
        );

        // Style name với period-appropriate typography
        holder.nameTextView.setText(category.getDisplayName());
        holder.nameTextView.setTypeface(getPeriodFont(category.getDecade()));

        // Premium badge cho locked styles
        holder.premiumBadge.setVisibility(
            category.hasLockedStyles() && !isPremiumUser ? View.VISIBLE : View.GONE
        );
    }
}
```

### Animation System

```java
// Smooth style transitions
public void animateStyleChange(Style fromStyle, Style toStyle) {
    ValueAnimator styleAnimator = ValueAnimator.ofFloat(0f, 1f);
    styleAnimator.setDuration(400);
    styleAnimator.setInterpolator(new DecelerateInterpolator());

    styleAnimator.addUpdateListener(animation -> {
        float progress = (float) animation.getAnimatedValue();
        StyleParameters blended = blendStyleParameters(fromStyle.getParameters(),
                                                     toStyle.getParameters(), progress);
        styleRenderEngine.updateParameters(blended);
    });

    styleAnimator.start();
}
```

### Premium UI Flow

```java
public void handlePremiumStyleSelection(Style style) {
    if (!subscriptionManager.isPremiumUser()) {
        // Show premium upgrade dialog
        PremiumUpgradeDialog dialog = new PremiumUpgradeDialog();
        dialog.setSelectedStyle(style);
        dialog.setOnUpgradeListener(() -> {
            // Start subscription flow
            billingManager.launchPremiumSubscription();
        });
        dialog.show(fragmentManager, "premium_upgrade");
    } else {
        applyStyle(style);
    }
}
```

## Performance Optimization

### Shader Caching System

```java
public class ShaderCache {
    private LruCache<String, StyleShader> cache;
    private ExecutorService preloadExecutor;

    public ShaderCache(int maxSize) {
        cache = new LruCache<>(maxSize);
        preloadExecutor = Executors.newSingleThreadExecutor();
    }

    public void preloadStyleShaders(List<Style> styles) {
        preloadExecutor.execute(() -> {
            for (Style style : styles) {
                if (!cache.get(style.getStyleId())) {
                    StyleShader shader = loadShaderForStyle(style);
                    cache.put(style.getStyleId(), shader);
                }
            }
        });
    }
}
```

### Memory Management

- **Texture recycling**: Reuse GL textures
- **Shader compilation**: Cache compiled shaders
- **Bitmap optimization**: Use appropriate bitmap configs
- **Background loading**: Preload popular styles

## Testing Strategy

### Visual Quality Tests

```java
@Test
public void testStyleAccuracy() {
    // Load reference images for each decade
    // Apply styles and compare với expected output
    // Validate color accuracy và visual effects

    for (DecadeType decade : DecadeType.values()) {
        Bitmap reference = loadReferenceImage(decade);
        Bitmap result = styleEngine.applyStyle(getStyleForDecade(decade), reference);

        float similarity = ImageComparator.calculateSimilarity(result,
                                                              getExpectedOutput(decade));
        assertTrue("Style accuracy below threshold", similarity > 0.85f);
    }
}
```

### Performance Tests

- Frame rate maintenance (30fps)
- Memory usage monitoring
- Shader compilation time
- Style switching latency

## Acceptance Criteria

### Core Functionality

- ✅ 5 decade categories với 3-4 variations mỗi category
- ✅ Real-time preview của styles trong camera viewfinder
- ✅ Premium/free style differentiation với appropriate locks
- ✅ Smooth transitions khi switching between styles
- ✅ Long-press để access sub-variations của mỗi decade

### Visual Quality

- ✅ Period-accurate color grading cho mỗi decade
- ✅ Authentic film simulation effects
- ✅ High-quality real-time rendering
- ✅ Consistent visual style across variations

### Performance Requirements

- ✅ Maintain 30fps camera preview với styles applied
- ✅ Style switching <200ms transition time
- ✅ Memory usage <100MB cho all loaded styles
- ✅ Smooth scrolling trong style carousel

### Premium Integration

- ✅ Clear differentiation between free và premium styles
- ✅ Smooth upgrade flow cho premium access
- ✅ Graceful handling của subscription states
- ✅ Trial period implementation

## Integration Dependencies

### Required Modules

- **Camera Manager**: Real-time preview integration
- **Premium Manager**: Subscription status và billing
- **Style Engine**: Core rendering system
- **User Preferences**: Style usage tracking và favorites

### Data Flow

1. User selects decade → Load style variations
2. Style selection → Apply to camera preview
3. Premium style selected → Check subscription status
4. Style applied → Update usage analytics
5. Photo capture → Apply selected style to final image

## Future Enhancements

- **Custom style creation**: User-defined color grading
- **Style learning**: AI adapts styles to user preferences
- **Seasonal styles**: Holiday và event-specific variations
- **Professional presets**: Cinema và photography industry standards
- **Style sharing**: Community-created và shared styles
