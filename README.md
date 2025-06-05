# **BẢN TÓM TẮT CHIẾN LƯỢC SẢN PHẨM**

## **1. Tên gọi & Slogan**

- **Tên đề xuất:** VintageVibe
- **Slogan:** "Capture Yesterday's Soul with Tomorrow's Intelligence"

## **2. Phân tích Vấn đề & Giải pháp**

- **Vấn đề Cốt lõi:**

  - Người dùng khó tạo ra những bức ảnh retro chất lượng cao mà không có kiến thức về nhiếp ảnh
  - Các ứng dụng filter hiện tại chỉ áp dụng hiệu ứng đơn thuần mà không tối ưu cho từng cảnh quay cụ thể
  - Việc chụp ảnh retro đẹp đòi hỏi hiểu biết về ánh sáng, góc độ và composition mà người dùng thường thiếu
  - Tỷ lệ ảnh bị "hỏng" hoặc không đạt kỳ vọng cao, dẫn đến frustration và thời gian lãng phí

- **Giải pháp Đề xuất:**  
  VintageVibe sử dụng computer vision và CoreML để phân tích real-time môi trường chụp (ánh sáng, đối tượng, background) và tự động đề xuất:

  - Góc chụp tối ưu thông qua hướng dẫn AR overlay
  - Bộ lọc retro phù hợp nhất (film grain, color grading, vintage effects)
  - Điều chỉnh thông số camera tự động (exposure, contrast, saturation)
  - Gợi ý pose và composition theo phong cách thập niên cụ thể

## **3. Chân dung Người dùng Mục tiêu (User Persona)**

- **Persona chính:**
  - **Tên:** Maya - Creative Content Creator (22-35 tuổi)
  - **Công việc:** Social media influencer, blogger thời trang, sinh viên nghệ thuật
  - **Thói quen:** Đăng 5-10 bức ảnh/tuần lên Instagram/TikTok, dành 30-60 phút/ngày để edit ảnh
  - **Trình độ công nghệ:** Thành thạo smartphone, sử dụng 3-4 app chỉnh ảnh khác nhau
  - **Mục tiêu:** Tạo ra aesthetic feed nhất quán với phong cách retro/vintage độc đáo để xây dựng personal brand
  - **Nỗi đau:** Mất quá nhiều thời gian thử nghiệm filters, kết quả không nhất quán, thiếu confidence trong kỹ năng chụp ảnh, áp lực phải tạo ra content quality cao liên tục

## **4. Tầm nhìn & Lợi thế Cạnh tranh**

- **Tầm nhìn Sản phẩm:**  
  Trở thành "nhiếp ảnh gia ảo" cá nhân hóa cho mỗi người dùng, giúp họ tự tin tạo ra những tác phẩm nghệ thuật retro chất lượng professional chỉ bằng smartphone, bất kể trình độ kỹ thuật.
- **Lợi thế Cạnh tranh Độc nhất (USP):**

  - **AI Photography Coach:** Đầu tiên kết hợp real-time scene analysis với guided photography coaching
  - **Context-Aware Filtering:** Bộ lọc thông minh thay đổi theo môi trường thực tế thay vì áp dụng cố định
  - **Predictive Aesthetic:** AI học hỏi từ style cá nhân của user để đề xuất filters và compositions phù hợp với "signature look"
  - **One-Shot Perfect:** Giảm thiểu số lần chụp lại nhờ guidance tức thời, tiết kiệm thời gian edit

## **5. Các Chỉ số Thành công Chính (Key Success Metrics)**

- **Photo Success Rate:** % ảnh được user giữ lại và chia sẻ sau lần chụp đầu tiên (mục tiêu: >75%)
- **Daily Active Sessions:** Số lần mở app mỗi ngày để chụp ảnh (mục tiêu: 2.5 sessions/user/day)
- **Feature Adoption Rate:** % user sử dụng AI guidance thay vì chỉ áp filter đơn thuần (mục tiêu: >60%)
- **Time to Great Shot:** Thời gian trung bình từ mở app đến có 1 bức ảnh hài lòng (mục tiêu: <3 phút)
- **User Retention (Week 4):** % user còn active sau 4 tuần đầu (mục tiêu: >45%)
- **Premium Conversion Rate:** % user chuyển từ free sang premium features (mục tiêu: >12%)

---

**BÁO CÁO PHÂN TÍCH THỊ TRƯỜNG & GỢI Ý**

#### **1. Phân tích Đối thủ Cạnh tranh**

**Đối thủ #1: VSCO**

- **Mô tả ngắn:** Ứng dụng chỉnh ảnh chuyên nghiệp với cộng đồng sáng tạo mạnh mẽ, nổi tiếng với bộ sưu tập preset film emulation chất lượng cao
- **Điểm mạnh chính:**
  - Bộ filter chất lượng cao với độ chính xác màu sắc tuyệt vời
  - Cộng đồng photographer chuyên nghiệp
  - Công cụ editing manual chi tiết và mạnh mẽ
  - Brand recognition cao trong giới nhiếp ảnh
- **Điểm yếu chí mạng:**
  - Interface phức tạp, overwhelming cho người mới
  - Không có guidance, user phải tự mò mẫm
  - Quá focus vào editing hậu kỳ, thiếu hỗ trợ khi chụp
  - Paywall cao cho các filter tốt nhất
- **Các tính năng độc đáo:** Journal feature cho storytelling, Film emulation presets của các brand film nổi tiếng
- **Mô hình kinh doanh:** Freemium với VSCO X membership ($19.99/year) unlock premium presets và tools

**Đối thủ #2: Huji Cam**

- **Mô tả ngắn:** Ứng dụng camera retro đơn giản mô phỏng máy ảnh film của thập niên 90s, tập trung vào trải nghiệm authentic
- **Điểm mạnh chính:**
  - UI/UX đơn giản, dễ sử dụng
  - Hiệu ứng film grain và light leaks realistic
  - Không cần editing, chụp là ra kết quả luôn
  - Kích thước app nhỏ gọn
- **Điểm yếu chí mạng:**
  - Thiếu tùy chỉnh, chỉ có 1 style cố định
  - Không có AI hay smart features
  - Chất lượng ảnh đầu ra có thể không đồng nhất
  - Ít tính năng social và sharing
- **Các tính năng độc đáo:** Random light leaks và date stamp authentic, Disposable camera simulation
- **Mô hình kinh doanh:** One-time purchase ($0.99-$2.99) với ads

**Đối thủ #3: Adobe Lightroom Mobile**

- **Mô tả ngắn:** Phiên bản mobile của công cụ editing chuyên nghiệp hàng đầu, mạnh mẽ nhất về khả năng xử lý RAW và editing chi tiết
- **Điểm mạnh chính:**
  - Công cụ editing professional-grade
  - Xử lý RAW files
  - Sync với desktop version
  - Preset marketplace phong phú
- **Điểm yếu chí mạng:**
  - Learning curve cực kỳ cao cho casual users
  - Interface phức tạp, không thân thiện với mobile
  - Thiếu hoàn toàn camera features và real-time guidance
  - Giá đắt và yêu cầu subscription
- **Các tính năng độc đáo:** Professional RAW processing, Cloud sync across devices, AI-powered auto selections
- **Mô hình kinh doanh:** Subscription model ($9.99/month) as part of Creative Cloud

**Đối thủ #4: Retrica**

- **Mô tả ngắn:** Ứng dụng camera với focus mạnh vào real-time filters và vintage effects, phổ biến trong cộng đồng selfie và casual photography
- **Điểm mạnh chính:**
  - Real-time preview của filters trong camera
  - Bộ sưu tập filter vintage đa dạng
  - Interface thân thiện và colorful
  - Tích hợp sẵn sharing tools
- **Điểm yếu chí mạng:**
  - Chất lượng filter không cao, trông "fake"
  - Thiếu guidance và AI features
  - Quá nhiều ads trong free version
  - Target audience quá broad, không đủ specialized
- **Các tính năng độc đáo:** Combo shots feature, Timer with multiple shots, Live filter preview
- **Mô hình kinh doanh:** Freemium với premium subscription ($2.99/month) để remove ads và unlock filters

#### **2. Các "Anti-Pattern" cần tránh**

- **Overwhelming Interface:** Tránh thiết kế interface phức tạp như Lightroom hoặc quá nhiều options như VSCO khiến người dùng bị choáng ngợp
- **Generic One-Size-Fits-All Filters:** Không áp dụng filter cố định mà không xem xét context như Huji Cam, cần intelligent contextual filtering
- **High Learning Curve:** Tránh yêu cầu user phải học nhiều để sử dụng effectively, tập trung vào intuitive design
- **Aggressive Monetization:** Không đặt paywall ngay từ core features cơ bản, tránh quá nhiều ads làm gián đoạn trải nghiệm
- **Lack of Instant Gratification:** Tránh workflow dài dòng từ chụp → import → edit → export, cần immediate results
- **Poor Quality Free Features:** Không để free version quá hạn chế khiến user thất vọng ngay từ đầu
- **Inconsistent Results:** Tránh việc cùng 1 filter cho ra kết quả khác nhau tùy điều kiện mà không có explanation

#### **3. Bảng Gợi ý Tính năng Chiến lược**

Tính năng Gợi ý

Mô tả & Lợi ích

Mức độ Ưu tiên

**AI Scene Intelligence**

Camera tự động nhận diện môi trường (indoor/outdoor, lighting conditions, subjects) và suggest optimal retro style phù hợp. Giúp Maya không phải đoán mò filter nào phù hợp với từng tình huống.

Must-have

**Real-time Composition Guide**

AR overlay hiển thị rule of thirds, golden ratio và leading lines để guide user compose shots đẹp hơn. Giúp Maya tự tin hơn về composition skills.

Must-have

**Smart Exposure Assistant**

AI tự động điều chỉnh exposure, highlights, shadows real-time dựa trên scene analysis. Maya không cần hiểu technical camera settings nhưng vẫn có ảnh exposure hoàn hảo.

Must-have

**Decade-Specific Style Profiles**

Bộ preset theo từng thập kỷ (60s, 70s, 80s, 90s, Y2K) với accurate color grading và characteristics. Giúp Maya tạo ra themed content cho different moods.

Must-have

**One-Tap Perfect Shot**

Kết hợp tất cả AI suggestions vào 1 nút "Perfect Shot" cho người dùng muốn quick results. Maya có thể tạo great content ngay cả khi vội vàng.

Should-have

**Personal Style Learning**

AI học preferences của user qua thời gian và suggest filters phù hợp với signature aesthetic của họ. Maya sẽ có consistent personal brand style.

Should-have

**Pose Suggestion Engine**

AI suggest poses dựa trên detected subjects và retro style đang chọn. Giúp Maya và friends tạo ra authentic vintage poses.

Should-have

**Weather-Adaptive Filtering**

Integration với weather API để adjust filters theo điều kiện thời tiết real-time. Cloudy day sẽ có filter khác với sunny day.

Should-have

**Quick Tutorial Tooltips**

Contextual mini-tutorials xuất hiện khi cần, giải thích tại sao AI suggest option này. Maya học được photography knowledge một cách natural.

Should-have

**Batch Style Transfer**

Apply cùng 1 style setting cho multiple photos trong gallery. Maya có thể tạo ra cohesive Instagram feed nhanh chóng.

Should-have

**Social Proof Validation**

Show preview của how photo sẽ perform trên social media (engagement prediction) dựa trên AI analysis. Maya biết ảnh nào sẽ viral.

Nice-to-have

**Collaborative Shot Planning**

Multiple users có thể join 1 session để plan group shots với AI coordination. Perfect cho Maya và friends khi đi chơi group.

Nice-to-have

**Vintage Camera Sound Pack**

Authentic shutter sounds từ các vintage cameras để enhance experience. Thêm nostalgia factor cho Maya.

Nice-to-have

**Time-of-Day Optimization**

AI suggest best shooting times dựa trên location và desired aesthetic (golden hour recommendations). Maya plan được content calendar efficiently.

Nice-to-have

**Style Challenge Generator**

Weekly challenges với specific vintage themes để inspire creativity. Keep Maya engaged và generate more content ideas.

Nice-to-have

**Advanced Light Leak Simulation**

Realistic film light leaks dựa trên detected light sources trong scene. More authentic hơn random overlays của competitors.

Nice-to-have

#### **4. Insight về Hành vi Người dùng**

- **Micro-moment Photography:** Users chụp ảnh trong những khoảnh khắc ngắn (vài giây quyết định), không có thời gian setup phức tạp
- **Social Validation Dependency:** Quyết định giữ hay xóa ảnh phụ thuộc nhiều vào anticipated social media performance
- **Trial-and-Error Fatigue:** Users mệt mỏi với việc phải thử nhiều filters để tìm ra cái phù hợp, muốn AI predict được taste của họ
- **Aesthetic Consistency Pressure:** Pressure to maintain consistent visual brand trên social media, cần tools giúp achieve điều này
- **Instant Gratification Expectation:** Expect immediate results, không muốn spend time learning complex tools
- **Context-Switching Cost:** Users không muốn switch between multiple apps cho camera → editing → sharing workflow

#### **5. Recommendation tối ưu cho MVP**

- **Focus on Camera-First Experience:** Khác với competitors focus vào editing, RetroLens AI nên prioritize smart camera features với instant preview
- **Progressive Complexity:** Start với simple one-tap solutions, gradually introduce more advanced features as users get comfortable
- **Contextual Intelligence:** Đầu tư mạnh vào scene recognition và environmental awareness thay vì just more filters
- **Educational Nudges:** Subtly educate users về photography principles through AI suggestions thay vì explicit tutorials
- **Social Integration:** Built-in preview của how photos sẽ look trên major social platforms để reduce anxiety về posting

---

### **BẢN THIẾT KẾ SẢN PHẨM TOÀN DIỆN (PRODUCT BLUEPRINT)**

#### **1. Kiến trúc Thông tin & Luồng Chính**

- **Cấu trúc Điều hướng:**

  - **Tab Navigation chính (Bottom):** Camera (Icon: Lens) | Gallery (Icon: Grid) | Discover (Icon: Compass) | Profile (Icon: User)
  - **Camera Screen:** Floating AI Coach button (top-left), Style selector (bottom carousel), Settings (top-right gear icon)
  - **Overlay Elements:** Real-time composition guides, exposure indicators, AI suggestions panel (slide-up)
  - **Quick Access:** Double-tap anywhere để mở Camera, Long-press camera button để record video, Swipe left/right để switch styles

- **Luồng Người dùng Then chốt (New User to First Great Shot):**

  1.  **App Launch** → Welcome screen với 3-slide onboarding (30 seconds)
  2.  **Permission Setup** → Camera + Location permissions với clear value proposition
  3.  **Style Preference Quiz** → 5 questions để AI hiểu aesthetic taste (60 seconds)
  4.  **Camera Introduction** → Interactive tutorial với practice shot (2 minutes)
  5.  **First Guided Shot** → AI coach guides toàn bộ process từ composition đến filter selection
  6.  **Success Celebration** → Show before/after comparison, encourage sharing
  7.  **Gentle Premium Nudge** → "Unlock 20+ vintage styles" soft CTA

#### **2. Cây Tính năng & Đặc tả Chi tiết**

### **1.1 - AI Scene Intelligence**

- **Mô tả & User Story:** "Là một content creator, tôi muốn camera tự động hiểu môi trường xung quanh và suggest style phù hợp để tôi không phải đoán mò filter nào sẽ work tốt nhất."
- **Logic & Quy tắc Nghiệp vụ:**

  - Phân tích real-time: lighting conditions (natural/artificial/mixed), subject type (person/object/landscape), indoor/outdoor detection
  - Confidence threshold: Chỉ show suggestions khi AI confidence >75%
  - Fallback rule: Nếu không detect được clear scene, default to user's preferred style từ quiz
  - Context switching: Re-analyze scene mỗi 2 giây hoặc khi camera movement detected

- **Dữ liệu Liên quan:**

  - `scene_type` (enum: portrait, landscape, indoor, outdoor, food, object)
  - `lighting_quality` (float: 0-1, where 1 = ideal)
  - `suggested_style_id` (foreign key to Style table)
  - `confidence_score` (float: 0-1)
  - `analysis_timestamp`

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Subtle animated glow around camera viewfinder khi AI đang analyze
  - **Interest:** Small floating card (top-left) shows detected scene với icon (🌅 Golden Hour, 🏠 Indoor, 👤 Portrait)
  - **Desire:** "✨ Perfect for 70s Warm" suggestion appears với preview thumbnail
  - **Action:** Tap suggestion để auto-apply style, hoặc ignore để manual select

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Floating detection icon với "Analyzing..." text
  - **Trạng thái Đang tải (Loading):** Pulsing animation trên scene detection card
  - **Trạng thái Lỗi (Error):** "Manual mode" fallback với basic scene options
  - **Trạng thái Thành công (Success):** Smooth transition đến suggested style với haptic feedback

### **1.2 - Real-time Composition Guide**

- **Mô tả & User Story:** "Là một người không có background nhiếp ảnh, tôi muốn có guidance về cách compose shots đẹp mà không cần học theory phức tạp."
- **Logic & Quy tắc Nghiệp vụ:**

  - Rule of thirds overlay: Hiển thị grid 3x3 với opacity 20%
  - Subject detection: AI identify main subjects và suggest positioning
  - Leading lines detection: Highlight natural lines trong scene
  - Balance indicator: Show visual weight distribution
  - Auto-hide: Guides fade sau 3 giây không movement

- **Dữ liệu Liên quan:**

  - `guide_type` (enum: rule_of_thirds, golden_ratio, leading_lines, symmetry)
  - `subject_positions` (array of x,y coordinates)
  - `composition_score` (float: 0-100)
  - `user_followed_guide` (boolean)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Gentle golden grid lines overlay trên camera view
  - **Interest:** Animated dots suggest where để place subjects
  - **Desire:** Composition score meter (0-100) ở corner với color coding (red<50, yellow 50-80, green >80)
  - **Action:** Subtle haptic feedback khi achieve good composition

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Faded grid lines, no subject detection
  - **Trạng thái Đang tải (Loading):** Grid appears gradually as AI detects subjects
  - **Trạng thái Lỗi (Error):** Basic grid without smart suggestions
  - **Trạng thái Thành công (Success):** Green checkmark animation khi perfect composition achieved

### **1.3 - Smart Exposure Assistant**

- **Mô tả & User Story:** "Là một user không hiểu về camera settings, tôi muốn ảnh luôn có exposure hoàn hảo mà không cần adjust manual."
- **Logic & Quy tắc Nghiệp vụ:**

  - Real-time histogram analysis để detect overexposure/underexposure
  - Auto-adjust exposure compensation trong range ±2 stops
  - HDR trigger: Tự động enable HDR khi high contrast scenes detected
  - Face priority: Ensure faces không bị over/under exposed
  - Vintage adjustment: Slightly overexpose for film-like aesthetic

- **Dữ liệu Liên quan:**

  - `exposure_value` (float: -2.0 to +2.0)
  - `hdr_enabled` (boolean)
  - `histogram_data` (array of luminance values)
  - `face_exposure_priority` (boolean)
  - `manual_override` (boolean)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Exposure meter ở side của screen với smooth animations
  - **Interest:** Color-coded indicator (blue=underexposed, green=perfect, orange=overexposed)
  - **Desire:** "Auto-Perfect" badge appears khi AI optimizes exposure
  - **Action:** Tap exposure meter để manual override nếu cần

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Thin exposure meter với neutral position
  - **Trạng thái Đang tải (Loading):** Meter animates as AI calculates optimal exposure
  - **Trạng thái Lỗi (Error):** Manual exposure slider appears
  - **Trạng thái Thành công (Success):** Green "✓ Optimized" indicator

### **1.4 - Decade-Specific Style Profiles**

- **Mô tả & User Story:** "Là một creative content creator, tôi muốn easily switch between different vintage eras để create themed content consistent với mood tôi muốn express."
- **Logic & Quy tắc Nghiệp vụ:**

  - 5 core decades: 1960s, 1970s, 1980s, 1990s, Y2K (2000s)
  - Mỗi decade có 3-4 sub-variations (Bright, Moody, Faded, Classic)
  - Real-time preview trong camera viewfinder
  - Style inheritance: User preferences influence which variations show first
  - Premium styles: 2 base styles free, unlock more với subscription

- **Dữ liệu Liên quan:**

  - `decade_id` (enum: 60s, 70s, 80s, 90s, y2k)
  - `variation_name` (string: bright, moody, faded, classic)
  - `color_profile` (JSON: curves, saturation, contrast values)
  - `film_grain_intensity` (float: 0-1)
  - `is_premium` (boolean)
  - `usage_count` (integer)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Horizontal carousel ở bottom với decade thumbnails
  - **Interest:** Each thumbnail shows mini preview của style applied to current scene
  - **Desire:** Style names với nostalgic fonts matching era ("Groovy 70s", "Neon 80s")
  - **Action:** Tap để instant apply, long-press để see sub-variations

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Carousel với current style highlighted
  - **Trạng thái Đang tải (Loading):** Preview thumbnails loading với skeleton screens
  - **Trạng thái Lỗi (Error):** Default style carousel với basic filters
  - **Trạng thái Thành công (Success):** Smooth transition animation between styles

### **1.5 - One-Tap Perfect Shot**

- **Mô tả & User Story:** "Là một user thường vội vàng, tôi muốn có 1 nút magic để instantly tạo ra perfect shot mà không cần adjust gì cả."
- **Logic & Quy tắc Nghiệp vụ:**

  - Combines: AI scene intelligence + optimal exposure + best style suggestion + composition guide
  - Smart timing: Wait for optimal moment (stable hands, good lighting)
  - Burst capture: Take 3 shots rapid fire, AI picks best one
  - Auto-enhance: Apply noise reduction, sharpening, color correction
  - Learning algorithm: Improve suggestions based on user's kept vs deleted photos

- **Dữ liệu Liên quan:**

  - `perfect_shot_settings` (JSON: all applied optimizations)
  - `burst_photos` (array: 3 captured images)
  - `selected_photo_id` (foreign key to best photo)
  - `user_rating` (float: user feedback on result)
  - `processing_time` (float: seconds to complete)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Large, prominent "✨ Perfect Shot" button với golden gradient
  - **Interest:** Button pulses gently khi all AI systems ready
  - **Desire:** "AI Optimized" badge với confidence percentage (94% Perfect Match)
  - **Action:** Single tap triggers full AI pipeline với satisfying animation

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Button available với subtle glow effect
  - **Trạng thái Đang tải (Loading):** "Analyzing scene..." với progress indicator
  - **Trạng thái Lỗi (Error):** Fallback to regular capture với notification
  - **Trạng thái Thành công (Success):** "Perfect!" celebration với photo reveal animation

### **2.1 - User Onboarding Flow**

- **Mô tả & User Story:** "Là một first-time user, tôi muốn quickly understand app value và set up preferences để có personalized experience ngay từ đầu."
- **Logic & Quy tắc Nghiệp vụ:**

  - 3-slide intro: Problem → Solution → Value proposition (30s max)
  - Style quiz: 5 image-based questions để determine aesthetic preferences
  - Skip option: Advanced users có thể skip quiz
  - Permission flow: Camera → Photos → Location với clear explanations
  - Tutorial trigger: Mandatory cho first shot, optional sau đó

- **Dữ liệu Liên quan:**

  - `onboarding_completed` (boolean)
  - `quiz_responses` (JSON: user style preferences)
  - `permissions_granted` (JSON: camera, photos, location status)
  - `tutorial_completed` (boolean)
  - `skip_count` (integer: track skipped steps)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Welcome screen với hero image showing before/after transformation
  - **Interest:** "Create vintage masterpieces in seconds" headline với benefit bullets
  - **Desire:** Style quiz với beautiful example photos: "Which vibe speaks to you?"
  - **Action:** "Start Creating" CTA button leading to camera

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Clean welcome screen với progress dots
  - **Trạng thái Đang tải (Loading):** Smooth transitions between slides
  - **Trạng thái Lỗi (Error):** Retry options cho failed permission requests
  - **Trạng thái Thành công (Success):** "You're all set!" confirmation với camera preview

### **2.2 - Gallery Management & Organization**

- **Mô tả & User Story:** "Là một content creator với nhiều photos, tôi muốn easily organize và find lại những shots tốt nhất để reuse cho content."
- **Logic & Quy tắc Nghiệp vụ:**

  - Auto-categorization: AI tags photos by style, subject, location
  - Smart albums: "Best shots", "Recent", "By Style", "Ready to Share"
  - Search functionality: Text search, visual similarity search
  - Export options: Original + Edited versions, Multiple resolutions
  - Cloud sync: Optional backup to user's preferred cloud service

- **Dữ liệu Liên quan:**

  - `photo_id` (primary key)
  - `original_path`, `edited_path` (file locations)
  - `ai_tags` (array: detected subjects, emotions, styles)
  - `user_rating` (integer: 1-5 stars)
  - `share_count` (integer: times shared to social)
  - `created_date`, `modified_date`

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Grid layout với smart thumbnails showing best shots first
  - **Interest:** Filter tabs: "All", "Favorites", "Recent", "By Decade"
  - **Desire:** "Quick Share" button với social platform icons
  - **Action:** Tap photo để full view, long-press để multi-select

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Grid với placeholder thumbnails loading
  - **Trạng thái Đang tải (Loading):** Progressive image loading với blur-to-sharp effect
  - **Trạng thái Lỗi (Error):** "Couldn't load photos" với retry button
  - **Trạng thái Thành công (Success):** Smooth grid với infinite scroll

### **2.3 - Social Sharing Integration**

- **Mô tả & User Story:** "Là một social media user, tôi muốn seamlessly share photos đến multiple platforms với optimal sizing và quality cho mỗi platform."
- **Logic & Quy tắc Nghiệp vụ:**

  - Platform optimization: Auto-resize/crop cho Instagram (1:1, 4:5, 9:16), TikTok (9:16), Facebook (16:9)
  - Quality presets: High quality cho Instagram, optimized cho Stories
  - Hashtag suggestions: AI suggest relevant hashtags based on image content
  - Caption templates: Style-specific caption starters
  - Analytics tracking: Monitor which photos perform best

- **Dữ liệu Liên quan:**

  - `platform` (enum: instagram, tiktok, facebook, twitter)
  - `export_dimensions` (string: "1080x1080", "1080x1350")
  - `suggested_hashtags` (array of strings)
  - `share_timestamp`
  - `engagement_tracking` (JSON: likes, comments if available)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Share sheet với platform icons và preview thumbnails
  - **Interest:** "Optimized for Instagram" labels với preview của how photo sẽ look
  - **Desire:** Hashtag suggestions với engagement potential indicators
  - **Action:** One-tap sharing với platform-specific optimization

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Share options với platform previews
  - **Trạng thái Đang tải (Loading):** "Optimizing for Instagram..." progress bar
  - **Trạng thái Lỗi (Error):** "Share failed" với retry option
  - **Trạng thái Thành công (Success):** "Shared successfully!" confirmation

### **2.4 - Premium Features & Monetization**

- **Mô tả & User Story:** "Là một power user, tôi muốn access advanced features và unlimited styles để create truly unique content và build my personal brand."
- **Logic & Quy tắc Nghiệp vụ:**

  - Freemium model: 5 basic styles free, 20+ premium styles
  - Usage limits: 10 Perfect Shots/day free, unlimited với premium
  - Advanced features: Custom style creation, batch processing, priority AI processing
  - Subscription tiers: Basic ($4.99/month), Pro ($9.99/month)
  - Free trial: 7 days full access, no credit card required

- **Dữ liệu Liên quan:**

  - `subscription_tier` (enum: free, basic, pro)
  - `subscription_expiry`
  - `usage_count` (daily perfect shots used)
  - `premium_features_used` (array)
  - `trial_start_date`, `trial_active` (boolean)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Premium styles với "✨ Pro" badges và preview locks
  - **Interest:** "Unlock 20+ exclusive vintage styles" với style gallery
  - **Desire:** "Join 50K+ creators" social proof với user testimonials
  - **Action:** "Start Free Trial" button với clear "No commitment" text

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Premium options với upgrade prompts
  - **Trạng thái Đang tải (Loading):** Subscription processing animation
  - **Trạng thái Lỗi (Error):** Payment failed với alternative payment methods
  - **Trạng thái Thành công (Success):** "Welcome to Pro!" celebration với new features unlocked

### **3.1 - Settings & Preferences**

- **Mô tả & User Story:** "Là một user với specific preferences, tôi muốn customize app behavior để match workflow và quality requirements của tôi."
- **Logic & Quy tắc Nghiệp vụ:**

  - Photo quality settings: High/Medium/Data Saver modes
  - AI assistance levels: Full/Moderate/Manual control options
  - Auto-save preferences: Save originals, edited only, or both
  - Notification settings: Tips, feature updates, social reminders
  - Privacy controls: Analytics opt-out, location data usage

- **Dữ liệu Liên quan:**

  - `photo_quality` (enum: high, medium, data_saver)
  - `ai_assistance_level` (enum: full, moderate, manual)
  - `auto_save_originals` (boolean)
  - `notifications_enabled` (JSON: tips, updates, reminders)
  - `privacy_settings` (JSON: analytics, location, crash_reports)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** Organized sections: "Photo Quality", "AI Assistance", "Privacy"
  - **Interest:** Toggle switches với clear explanations của impact
  - **Desire:** "Storage saved: 2.1GB" feedback cho data saver mode
  - **Action:** Immediate preview của setting changes

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Settings list với current values shown
  - **Trạng thái Đang tải (Loading):** Settings applying với brief loading states
  - **Trạng thái Lỗi (Error):** "Couldn't save settings" với retry
  - **Trạng thái Thành công (Success):** "Settings saved" confirmation toast

### **3.2 - Help & Support System**

- **Mô tả & User Story:** "Là một user gặp problems hoặc muốn learn more, tôi muốn quickly find answers và get help without leaving app."
- **Logic & Quy tắc Nghiệp vụ:**

  - Contextual help: Smart suggestions based on current screen/action
  - FAQ search: AI-powered search through common questions
  - Video tutorials: Short clips for key features
  - Contact support: In-app messaging với AI triage
  - Community features: User tips sharing, featured photos

- **Dữ liệu Liên quan:**

  - `help_topic_id` (foreign key to help articles)
  - `search_query` (string: user's help search)
  - `support_ticket_id` (for user communications)
  - `tutorial_completion` (array: completed video IDs)
  - `user_feedback_rating` (integer: 1-5 for help quality)

- **Mô tả Wireframe & UI/UX (Áp dụng AIDA):**

  - **Attention:** "Need help?" floating button với smart appearance timing
  - **Interest:** Search bar với "Try: How to create 80s style?" placeholder
  - **Desire:** Quick answers với "This helped 847 users" social proof
  - **Action:** "Contact us" button với estimated response time

- **Các Trạng thái Giao diện (UI States):**

  - **Trạng thái Mặc định:** Help categories với search functionality
  - **Trạng thái Đang tải (Loading):** Search results loading với suggestions
  - **Trạng thái Lỗi (Error):** "No results found" với alternative suggestions
  - **Trạng thái Thành công (Success):** Helpful articles với rating options

---

**LỜI KẾT:** Bản thiết kế này tạo ra một hệ sinh thái hoàn chỉnh cho RetroLens AI, nơi mỗi tính năng đều được thiết kế với mục tiêu cuối cùng là giúp Maya và những người dùng tương tự tự tin tạo ra những tác phẩm retro chất lượng professional chỉ trong vài giây. Mọi quyết định thiết kế đều hướng đến việc giảm thiểu friction và tối đa hóa instant gratification, đồng thời xây dựng một business model bền vững qua premium features có giá trị thực sự.

Tôi đã nhận được bản thiết kế sản phẩm toàn diện cho ứng dụng RetroLens AI. Tôi sẽ phân tích và tạo ra các prompt lập trình riêng biệt cho từng tính năng được định nghĩa trong cây tính năng, theo đúng format yêu cầu.

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 1.1 - AI Scene Intelligence

**User Story:** Là một content creator, tôi muốn camera tự động hiểu môi trường xung quanh và suggest style phù hợp để tôi không phải đoán mò filter nào sẽ work tốt nhất.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Phân tích real-time: lighting conditions (natural/artificial/mixed), subject type (person/object/landscape), indoor/outdoor detection thông qua camera preview frames.
- Confidence threshold: Chỉ hiển thị suggestions khi AI confidence >75%.
- Fallback rule: Nếu không detect được clear scene, default to user's preferred style từ quiz onboarding.
- Context switching: Re-analyze scene mỗi 2 giây hoặc khi camera movement detected.
- Phải gọi AI API `/ai/analyze-scene` với payload camera frame data và nhận về scene analysis results.
- Xử lý thành công: Hiển thị suggested style với confidence score.
- Xử lý thất bại: Fallback to manual mode với basic scene options.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `AISceneIntelligenceOverlay`.
- Subtle animated glow around camera viewfinder khi AI đang analyze.
- Small floating card (top-left) shows detected scene với icon (🌅 Golden Hour, 🏠 Indoor, 👤 Portrait).
- "✨ Perfect for 70s Warm" suggestion appears với preview thumbnail.
- Tap suggestion để auto-apply style, hoặc ignore để manual select.
- Floating detection icon với "Analyzing..." text khi đang phân tích.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `isAnalyzing`, `sceneData`, `suggestedStyle`, `confidenceScore`, `analysisError`.
- Khi `isAnalyzing` là true, hiển thị pulsing animation trên scene detection card.
- Khi `analysisError` có giá trị, hiển thị "Manual mode" fallback với basic scene options.
- Khi analysis thành công, smooth transition đến suggested style với haptic feedback.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- AI có thể phân tích scene trong thời gian thực từ camera preview.
- Hiển thị suggestions chỉ khi confidence score >75%.
- Fallback to user preferred style khi không detect được scene.
- Re-analyze mỗi 2 giây hoặc khi có camera movement.
- Component phải responsive và không lag camera preview.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 1.2 - Real-time Composition Guide

**User Story:** Là một người không có background nhiếp ảnh, tôi muốn có guidance về cách compose shots đẹp mà không cần học theory phức tạp.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Rule of thirds overlay: Hiển thị grid 3x3 với opacity 20%.
- Subject detection: AI identify main subjects và suggest positioning.
- Leading lines detection: Highlight natural lines trong scene.
- Balance indicator: Show visual weight distribution.
- Auto-hide: Guides fade sau 3 giây không movement.
- Phải gọi AI API `/ai/analyze-composition` với camera frame để nhận composition analysis.
- Xử lý thành công: Hiển thị composition guides và score.
- Xử lý thất bại: Hiển thị basic grid without smart suggestions.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `CompositionGuideOverlay`.
- Gentle golden grid lines overlay trên camera view.
- Animated dots suggest where để place subjects.
- Composition score meter (0-100) ở corner với color coding (red<50, yellow 50-80, green >80).
- Subtle haptic feedback khi achieve good composition.
- Grid lines tự động fade out sau 3 giây không có movement.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `isAnalyzingComposition`, `gridVisible`, `subjectPositions`, `compositionScore`, `guideType`.
- Khi `isAnalyzingComposition` là true, grid appears gradually as AI detects subjects.
- Khi analysis lỗi, hiển thị basic grid without smart suggestions.
- Khi perfect composition achieved, green checkmark animation với haptic feedback.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Hiển thị rule of thirds grid với opacity 20%.
- AI detect subjects và suggest optimal positioning.
- Composition score real-time từ 0-100 với color coding.
- Haptic feedback khi achieve good composition (>80).
- Auto-hide guides sau 3 giây không movement.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 1.3 - Smart Exposure Assistant

**User Story:** Là một user không hiểu về camera settings, tôi muốn ảnh luôn có exposure hoàn hảo mà không cần adjust manual.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Real-time histogram analysis để detect overexposure/underexposure.
- Auto-adjust exposure compensation trong range ±2 stops.
- HDR trigger: Tự động enable HDR khi high contrast scenes detected.
- Face priority: Ensure faces không bị over/under exposed.
- Vintage adjustment: Slightly overexpose for film-like aesthetic.
- Phải gọi Camera2 API để adjust exposure compensation automatically.
- Xử lý thành công: Apply optimal exposure settings.
- Xử lý thất bại: Show manual exposure slider.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `SmartExposureIndicator`.
- Exposure meter ở side của screen với smooth animations.
- Color-coded indicator (blue=underexposed, green=perfect, orange=overexposed).
- "Auto-Perfect" badge appears khi AI optimizes exposure.
- Tap exposure meter để manual override nếu cần.
- Thin exposure meter với neutral position as default.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `isOptimizingExposure`, `exposureValue`, `hdrEnabled`, `manualOverride`, `histogramData`.
- Khi `isOptimizingExposure` là true, meter animates as AI calculates optimal exposure.
- Khi optimization lỗi, manual exposure slider appears.
- Khi optimized thành công, green "✓ Optimized" indicator hiển thị.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Real-time histogram analysis và auto-exposure adjustment.
- Auto-enable HDR cho high contrast scenes.
- Face priority exposure để protect subject faces.
- Manual override option khi user tap exposure meter.
- Visual feedback với color-coded exposure indicator.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 1.4 - Decade-Specific Style Profiles

**User Story:** Là một creative content creator, tôi muốn easily switch between different vintage eras để create themed content consistent với mood tôi muốn express.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- 5 core decades: 1960s, 1970s, 1980s, 1990s, Y2K (2000s).
- Mỗi decade có 3-4 sub-variations (Bright, Moody, Faded, Classic).
- Real-time preview trong camera viewfinder.
- Style inheritance: User preferences influence which variations show first.
- Premium styles: 2 base styles free, unlock more với subscription.
- Phải gọi API `/styles/apply` với style_id và image data để apply filter.
- Xử lý thành công: Apply style real-time to camera preview.
- Xử lý thất bại: Fallback to default style carousel với basic filters.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `DecadeStyleCarousel`.
- Horizontal carousel ở bottom với decade thumbnails.
- Each thumbnail shows mini preview của style applied to current scene.
- Style names với nostalgic fonts matching era ("Groovy 70s", "Neon 80s").
- Tap để instant apply, long-press để see sub-variations.
- Premium styles có "✨ Pro" badges và preview locks.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `selectedDecade`, `selectedVariation`, `availableStyles`, `isPreviewLoading`, `isPremiumUser`.
- Khi `isPreviewLoading` là true, preview thumbnails loading với skeleton screens.
- Khi style application lỗi, default style carousel với basic filters.
- Khi style applied thành công, smooth transition animation between styles.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- 5 decade categories với 3-4 variations mỗi category.
- Real-time preview của styles trong camera viewfinder.
- Premium/free style differentiation với appropriate locks.
- Smooth transitions khi switching between styles.
- Long-press để access sub-variations của mỗi decade.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 1.5 - One-Tap Perfect Shot

**User Story:** Là một user thường vội vàng, tôi muốn có 1 nút magic để instantly tạo ra perfect shot mà không cần adjust gì cả.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Combines: AI scene intelligence + optimal exposure + best style suggestion + composition guide.
- Smart timing: Wait for optimal moment (stable hands, good lighting).
- Burst capture: Take 3 shots rapid fire, AI picks best one.
- Auto-enhance: Apply noise reduction, sharpening, color correction.
- Learning algorithm: Improve suggestions based on user's kept vs deleted photos.
- Phải gọi API `/ai/perfect-shot` với scene data để nhận optimal settings.
- Xử lý thành công: Capture burst, process, và return best photo.
- Xử lý thất bại: Fallback to regular capture với notification.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `PerfectShotButton`.
- Large, prominent "✨ Perfect Shot" button với golden gradient.
- Button pulses gently khi all AI systems ready.
- "AI Optimized" badge với confidence percentage (94% Perfect Match).
- Single tap triggers full AI pipeline với satisfying animation.
- "Analyzing scene..." với progress indicator during processing.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `isReady`, `isProcessing`, `burstPhotos`, `selectedPhoto`, `confidenceScore`, `processingError`.
- Khi `isProcessing` là true, "Analyzing scene..." với progress indicator.
- Khi processing lỗi, fallback to regular capture với notification.
- Khi thành công, "Perfect!" celebration với photo reveal animation.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Combine tất cả AI features thành single tap experience.
- Burst capture 3 photos và AI select best one.
- Auto-enhance với noise reduction và sharpening.
- Learning từ user behavior để improve suggestions.
- Satisfying UI feedback throughout entire process.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 2.1 - User Onboarding Flow

**User Story:** Là một first-time user, tôi muốn quickly understand app value và set up preferences để có personalized experience ngay từ đầu.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- 3-slide intro: Problem → Solution → Value proposition (30s max).
- Style quiz: 5 image-based questions để determine aesthetic preferences.
- Skip option: Advanced users có thể skip quiz.
- Permission flow: Camera → Photos → Location với clear explanations.
- Tutorial trigger: Mandatory cho first shot, optional sau đó.
- Phải gọi API `/user/onboarding` để save quiz responses và preferences.
- Xử lý thành công: Navigate to camera với personalized settings.
- Xử lý thất bại: Retry options cho failed permission requests.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `OnboardingFlow`.
- Welcome screen với hero image showing before/after transformation.
- "Create vintage masterpieces in seconds" headline với benefit bullets.
- Style quiz với beautiful example photos: "Which vibe speaks to you?".
- "Start Creating" CTA button leading to camera.
- Clean welcome screen với progress dots cho navigation.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `currentSlide`, `quizResponses`, `permissionsGranted`, `onboardingComplete`, `canSkip`.
- Khi transitioning, smooth transitions between slides.
- Khi permission failed, retry options cho failed permission requests.
- Khi complete, "You're all set!" confirmation với camera preview.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- 3-slide intro trong 30 giây với clear value proposition.
- 5-question style quiz để personalize experience.
- Permission flow với clear explanations.
- Skip option available cho advanced users.
- Smooth transitions và progress indication.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 2.2 - Gallery Management & Organization

**User Story:** Là một content creator với nhiều photos, tôi muốn easily organize và find lại những shots tốt nhất để reuse cho content.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Auto-categorization: AI tags photos by style, subject, location.
- Smart albums: "Best shots", "Recent", "By Style", "Ready to Share".
- Search functionality: Text search, visual similarity search.
- Export options: Original + Edited versions, Multiple resolutions.
- Cloud sync: Optional backup to user's preferred cloud service.
- Phải gọi API `/gallery/photos` để fetch user photos với pagination.
- Phải gọi API `/ai/tag-photo` để auto-tag photos với AI analysis.
- Xử lý thành công: Display organized photo gallery.
- Xử lý thất bại: "Couldn't load photos" với retry button.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `PhotoGallery`.
- Grid layout với smart thumbnails showing best shots first.
- Filter tabs: "All", "Favorites", "Recent", "By Decade".
- "Quick Share" button với social platform icons.
- Tap photo để full view, long-press để multi-select.
- Progressive image loading với blur-to-sharp effect.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `photos`, `isLoading`, `selectedFilter`, `selectedPhotos`, `searchQuery`, `loadError`.
- Khi `isLoading` là true, progressive image loading với blur-to-sharp effect.
- Khi `loadError` có giá trị, "Couldn't load photos" với retry button.
- Khi loaded thành công, smooth grid với infinite scroll.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Auto-categorization với AI tagging by style, subject, location.
- Smart albums: Best shots, Recent, By Style, Ready to Share.
- Search functionality: text và visual similarity search.
- Export options với multiple resolutions.
- Multi-select functionality với long-press.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 2.3 - Social Sharing Integration

**User Story:** Là một social media user, tôi muốn seamlessly share photos đến multiple platforms với optimal sizing và quality cho mỗi platform.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Platform optimization: Auto-resize/crop cho Instagram (1:1, 4:5, 9:16), TikTok (9:16), Facebook (16:9).
- Quality presets: High quality cho Instagram, optimized cho Stories.
- Hashtag suggestions: AI suggest relevant hashtags based on image content.
- Caption templates: Style-specific caption starters.
- Analytics tracking: Monitor which photos perform best.
- Phải gọi API `/ai/suggest-hashtags` với image data để nhận hashtag suggestions.
- Phải integrate với Android Share Intent để share to social platforms.
- Xử lý thành công: Share photo với platform-specific optimization.
- Xử lý thất bại: "Share failed" với retry option.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `SocialShareSheet`.
- Share sheet với platform icons và preview thumbnails.
- "Optimized for Instagram" labels với preview của how photo sẽ look.
- Hashtag suggestions với engagement potential indicators.
- One-tap sharing với platform-specific optimization.
- "Optimizing for Instagram..." progress bar during processing.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `selectedPlatforms`, `isOptimizing`, `suggestedHashtags`, `captionTemplate`, `shareError`.
- Khi `isOptimizing` là true, "Optimizing for Instagram..." progress bar.
- Khi `shareError` có giá trị, "Share failed" với retry option.
- Khi shared thành công, "Shared successfully!" confirmation.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Auto-resize cho multiple platforms với correct aspect ratios.
- AI hashtag suggestions based trên image content.
- Platform-specific quality optimization.
- One-tap sharing với native Android Share Intent.
- Visual preview của how photo sẽ appear trên each platform.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 2.4 - Premium Features & Monetization

**User Story:** Là một power user, tôi muốn access advanced features và unlimited styles để create truly unique content và build my personal brand.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Freemium model: 5 basic styles free, 20+ premium styles.
- Usage limits: 10 Perfect Shots/day free, unlimited với premium.
- Advanced features: Custom style creation, batch processing, priority AI processing.
- Subscription tiers: Basic ($4.99/month), Pro ($9.99/month).
- Free trial: 7 days full access, no credit card required.
- Phải integrate với Google Play Billing để handle subscriptions.
- Phải gọi API `/user/subscription` để verify subscription status.
- Xử lý thành công: Unlock premium features.
- Xử lý thất bại: Payment failed với alternative payment methods.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `PremiumUpgradeScreen`.
- Premium styles với "✨ Pro" badges và preview locks.
- "Unlock 20+ exclusive vintage styles" với style gallery.
- "Join 50K+ creators" social proof với user testimonials.
- "Start Free Trial" button với clear "No commitment" text.
- Subscription processing animation during payment.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `subscriptionTier`, `usageCount`, `premiumFeatures`, `isProcessingPayment`, `trialActive`.
- Khi `isProcessingPayment` là true, subscription processing animation.
- Khi payment failed, alternative payment methods.
- Khi subscription success, "Welcome to Pro!" celebration với new features unlocked.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Freemium model với clear limits và premium benefits.
- Google Play Billing integration cho subscriptions.
- 7-day free trial without credit card requirement.
- Usage tracking cho daily Perfect Shot limits.
- Premium feature unlocking based trên subscription status.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 3.1 - Settings & Preferences

**User Story:** Là một user với specific preferences, tôi muốn customize app behavior để match workflow và quality requirements của tôi.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Photo quality settings: High/Medium/Data Saver modes.
- AI assistance levels: Full/Moderate/Manual control options.
- Auto-save preferences: Save originals, edited only, or both.
- Notification settings: Tips, feature updates, social reminders.
- Privacy controls: Analytics opt-out, location data usage.
- Phải sử dụng SharedPreferences để persist user settings.
- Phải gọi API `/user/settings` để sync settings across devices.
- Xử lý thành công: Apply settings immediately.
- Xử lý thất bại: "Couldn't save settings" với retry.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `SettingsScreen`.
- Organized sections: "Photo Quality", "AI Assistance", "Privacy".
- Toggle switches với clear explanations của impact.
- "Storage saved: 2.1GB" feedback cho data saver mode.
- Immediate preview của setting changes.
- Settings list với current values shown clearly.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `photoQuality`, `aiAssistanceLevel`, `notificationSettings`, `privacySettings`, `isSaving`.
- Khi `isSaving` là true, settings applying với brief loading states.
- Khi save failed, "Couldn't save settings" với retry.
- Khi saved thành công, "Settings saved" confirmation toast.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Photo quality settings với storage impact feedback.
- AI assistance levels từ Full đến Manual control.
- Granular notification preferences.
- Privacy controls cho analytics và location data.
- Immediate application của setting changes.

**[KẾT THÚC PROMPT TÍNH NĂNG]**

---PROMPT_SEPARATOR---

**[BẮT ĐẦU PROMPT TÍNH NĂNG]**

**Tên Tính năng & ID:** 3.2 - Help & Support System

**User Story:** Là một user gặp problems hoặc muốn learn more, tôi muốn quickly find answers và get help without leaving app.

**Công nghệ Yêu cầu:** Java/Android

### **1. Yêu cầu về Logic & Chức năng:**

- Contextual help: Smart suggestions based on current screen/action.
- FAQ search: AI-powered search through common questions.
- Video tutorials: Short clips for key features.
- Contact support: In-app messaging với AI triage.
- Community features: User tips sharing, featured photos.
- Phải gọi API `/help/search` với user query để nhận relevant help articles.
- Phải gọi API `/support/ticket` để create support tickets.
- Xử lý thành công: Display helpful content và answers.
- Xử lý thất bại: "No results found" với alternative suggestions.

### **2. Yêu cầu về Giao diện & Trải nghiệm (UI/UX):**

- Component chính có tên là `HelpSupportScreen`.
- "Need help?" floating button với smart appearance timing.
- Search bar với "Try: How to create 80s style?" placeholder.
- Quick answers với "This helped 847 users" social proof.
- "Contact us" button với estimated response time.
- Help categories với search functionality prominently displayed.

### **3. Yêu cầu về Quản lý Trạng thái (State Management):**

- Cần quản lý các state: `searchQuery`, `searchResults`, `isSearching`, `supportTickets`, `featuredTutorials`.
- Khi `isSearching` là true, search results loading với suggestions.
- Khi no results found, alternative suggestions provided.
- Khi helpful content found, rating options để improve help quality.

### **4. Tiêu chí Hoàn thành (Acceptance Criteria):**

- Contextual help suggestions based trên current app screen.
- AI-powered search through FAQ và help articles.
- Video tutorials embedded cho key features.
- In-app support ticket creation và tracking.
- Community features với user tips và featured content.

**[KẾT THÚC PROMPT TÍNH NĂNG]**
