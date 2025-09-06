# Goat English - Frontend

## 📋 Giới thiệu

Goat English là một ứng dụng học tiếng Anh hiện đại, được thiết kế để giúp người dùng học tiếng Anh một cách hiệu quả thông qua các phương pháp tương tác và trò chơi hóa. Ứng dụng cung cấp các bài học theo chủ đề, flashcards, quiz, và các tính năng học tập thông minh.

## ✨ Tính năng chính

### 🎯 Học tập theo chủ đề
- Các chủ đề đa dạng: Công nghệ thông tin, Lập trình, Mạng máy tính, Phát triển web
- Bài học được cấu trúc theo cấp độ từ cơ bản đến nâng cao
- Từ vựng và ví dụ thực tế

### 🃏 Flashcards thông minh
- Hệ thống flashcards tương tác
- Hiển thị từ vựng, phiên âm, và nghĩa
- Giao diện flip card mượt mà

### 📚 Bài tập đa dạng
- **Fill in the blank**: Điền từ vào chỗ trống
- **Multiple choice**: Trắc nghiệm nhiều lựa chọn  
- **Complete sentences**: Hoàn thành câu
- **Choose answer**: Chọn đáp án đúng

### 📊 Theo dõi tiến độ
- Dashboard cá nhân với thống kê chi tiết
- Theo dõi điểm số và tiến độ học tập
- Lịch sử các bài học đã hoàn thành

### 🤖 Chatbot hỗ trợ
- Trợ lý AI giúp trả lời câu hỏi
- Hỗ trợ học tập 24/7
- Giao diện chat thân thiện

### 👤 Quản lý tài khoản
- Đăng ký/đăng nhập an toàn
- Quản lý thông tin cá nhân
- Cài đặt tài khoản linh hoạt

## 🛠️ Công nghệ sử dụng

### Frontend Framework
- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Routing cho Single Page Application
- **Pinia** - State management cho Vue 3

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS** - CSS preprocessor
- **DaisyUI** - Component library cho Tailwind

### Build Tools & Development
- **Vite** - Build tool và dev server nhanh
- **ESLint** - Code linting
- **Vitest** - Unit testing framework

### Utilities & Libraries
- **Axios** - HTTP client
- **Vue3-Toastify** - Toast notifications

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.x
- Bun (recommended) hoặc npm/yarn
- Git

### Cài đặt

1. **Clone repository**
```bash
git clone https://github.com/nqb3010/Goat-english-FE.git
cd Goat-english-FE
```

2. **Cài đặt dependencies**
```bash
# Sử dụng bun (recommended)
bun install

# Hoặc sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

3. **Cấu hình environment**
```bash
# Tạo file .env từ .env.example (nếu có)
cp .env.example .env

# Chỉnh sửa các biến môi trường cần thiết
```

### Chạy ứng dụng

```bash
# Development mode
bun dev

# Build cho production
bun run build

# Preview build
bun preview

# Chạy tests
bun test:unit

# Lint code
bun lint
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive hoàn toàn, hỗ trợ các thiết bị:

- **Desktop**: ≥ 1024px
- **Tablet**: 768px - 1023px  
- **Mobile**: ≤ 767px

## 🎨 Cấu trúc thư mục

```
src/
├── assets/          # Tài nguyên tĩnh (images, CSS, SCSS)
│   ├── css/         # CSS files
│   ├── scss/        # SCSS files
│   └── images/      # Hình ảnh
├── components/      # Vue components tái sử dụng
│   ├── icons/       # Icon components
│   ├── lessons/     # Components cho bài học
│   └── __tests__/   # Unit tests
├── data/            # Dữ liệu tĩnh và mock data
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
├── utils/           # Utility functions
└── views/           # Page components
    └── admin/       # Admin pages
```

## 🌟 Các trang chính

### Người dùng
- **Home** (`/`) - Trang chủ
- **Signup** (`/signup`) - Đăng ký tài khoản
- **Login** (`/login`) - Đăng nhập
- **Dashboard** (`/dashboard`) - Bảng điều khiển cá nhân
- **Topic** (`/topic`) - Danh sách chủ đề
- **Lesson** (`/lesson/:id`) - Chi tiết bài học
- **FlashCard** (`/flashcard`) - Học với flashcards
- **Vocabulary** (`/vocabulary`) - Từ vựng
- **Progress** (`/progress`) - Tiến độ học tập
- **Chatbot** (`/chatbot`) - Trò chuyện với AI
- **Setting** (`/setting`) - Cài đặt tài khoản

### Quản trị viên
- **Admin Dashboard** (`/admin`) - Bảng điều khiển admin
- **User Management** - Quản lý người dùng
- **Content Management** - Quản lý nội dung
- **Statistics** - Thống kê hệ thống

## 🔧 Scripts có sẵn

```bash
# Development
bun dev              # Chạy dev server
bun run build        # Build cho production
bun preview          # Preview build

# Testing
bun test:unit        # Chạy unit tests

# Code Quality
bun lint             # Lint với ESLint
```

## 🌐 API Integration

Ứng dụng kết nối với backend API để:
- Xác thực người dùng
- Lấy dữ liệu bài học và từ vựng
- Lưu tiến độ học tập
- Quản lý điểm số và thống kê

## 📦 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build
bun run build

# Upload dist/ folder to Netlify
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Tác giả

- **Nguyễn Quốc Bảo** - *Developer* - [nqb3010](https://github.com/nqb3010)

## 📞 Liên hệ

- Email: nqb3010@gmail.com
- Facebook: [facebook.com/nqb3010](https://www.facebook.com/nqb3010/)
- GitHub: [github.com/nqb3010](https://github.com/nqb3010/)

## 🙏 Acknowledgments

- Trường Đại học Công nghiệp Việt-Hung
- Vue.js Community
- Tailwind CSS Team

---

**Goat English** - Học tiếng Anh thông minh, hiệu quả và thú vị! 🚀
