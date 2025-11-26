// Thiết lập ngày giờ đám cưới
const weddingDate = new Date("2025-12-21T18:00:00");
// Hàm cập nhật đồng hồ đếm ngược
function updateCountdown() {
    const now = new Date();           // Lấy thời gian hiện tại
    const diff = weddingDate - now;   // Tính thời gian chênh lệch (mili-giây)

    // Lấy các phần tử HTML để hiển thị số
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    // Nếu không tìm thấy (hiếm khi xảy ra)
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // Nếu đã tới ngày cưới -> hiển thị 00
    if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        return;
    }

    // Chuyển đổi mili-giây ra ngày, giờ, phút, giây
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Gán số lên giao diện (kèm padStart để luôn có 2 chữ số)
    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
}

// Hàm xử lý người dùng gửi form RSVP
function handleRsvpSubmit(event) {
    event.preventDefault();   // Ngăn trang tự reload khi submit form

    // Lấy các ô input trong form
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const guestCountInput = document.getElementById("guest-count");
    const attendanceSelect = document.getElementById("attendance");
    const messageInput = document.getElementById("message");
    const statusEl = document.getElementById("rsvp-status");

    // Lấy giá trị người dùng nhập
    const name = nameInput.value.trim();
    const attendance = attendanceSelect.value;

    // Kiểm tra nhập đủ
    if (!name || !attendance) {
        statusEl.textContent = "Vui lòng điền đầy đủ Họ tên và lựa chọn tham dự.";
        return;
    }

    // Trường hợp có tham dự
    if (attendance === "yes") {
        statusEl.textContent = 'Cảm ơn ${name}! Chúng mình rất vui khi bạn sẽ tham dự cùng chúng mình.';
    }

    // Trường hợp không tham dự
    else {
        statusEl.textContent = 'Cảm ơn ${name} đã hồi đáp. Rất tiếc vì bạn không tham dự được!';
    }
}

// Cập nhật đồng hồ ngay khi tải trang
updateCountdown();

// Cập nhật lại mỗi giây
setInterval(updateCountdown, 1000);

// Gắn sự kiện submit cho form RSVP
const rsvpForm = document.getElementById("rsvp-form");
if (rsvpForm) {
    rsvpForm.addEventListener("submit", handleRsvpSubmit);
}

// Điều khiển nhạc nền
const music = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let musicPlaying = false;

// Khi nhấn nút bật/tắt
musicToggle.addEventListener("click", function() {
    if (musicPlaying) {
        music.pause();
        musicPlaying = false;
        musicToggle.textContent = "🔇";
    } else {
        music.play();
        musicPlaying = true;
        musicToggle.textContent = "🔊";
    }
});

// Hiệu ứng fade-in khi cuộn
const fadeElements = document.querySelectorAll(".fade-in");

function checkFadeIn() {
    fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 80;
        if (isVisible) {
            el.classList.add("show");
        }
    });
}

// Kiểm tra khi cuộn và ngay khi tải trang
window.addEventListener("scroll", checkFadeIn);
window.addEventListener("load", checkFadeIn);
// Slider Album ảnh cưới
const photos = [
    "https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg",
    "https://images.pexels.com/photos/1779491/pexels-photo-1779491.jpeg",
    "https://images.pexels.com/photos/2747557/pexels-photo-2747557.jpeg",
    "https://images.pexels.com/photos/3719850/pexels-photo-3719850.jpeg",
];
let currentPhoto = 0;

const galleryPhoto = document.getElementById("gallery-photo");
const prevBtn = document.getElementById("prev-photo");
const nextBtn = document.getElementById("next-photo");

function showPhoto(index) {
    // Công thức xoay vòng ảnh
    currentPhoto = (index + photos.length) % photos.length;
    galleryPhoto.src = photos[currentPhoto];
}
// Chuyển ảnh trái
prevBtn.addEventListener("click", () => {
    showPhoto(currentPhoto - 1);
});
// Chuyển ảnh phải
prevBtn.addEventListener("click", () => {
    showPhoto(currentPhoto + 1);
});

// Hiển thị ảnh đầu tiên
showPhoto(0);

// QR CODE - Tạo mã QR dẫn đến thiệp cưới
window.addEventListener("load", () => {
    const qrContainer = document.getElementById("qr-code");

    if (qrContainer) {
        const currentURL = window.location.href; //Lấy URL trang hiện tại

        new QRCode(qrContainer, {
            Text: currentURL,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.correctLevel.H
        });
    }
});
// Chia sẻ thiệp cưới
const shareURL = window.location.href;

document.getElementById("share-zalo").addEventListener("click", () => {
    const zaloURL = 'https://zalo.me/share?url=${encodeURIComponent(shareURL)}';
    window.open(zaloURL, "_blank");
});
document.getElementById("share-messenger").addEventListener("click", () => {
    const messengerURL = 'fb-messenger://share?link=$encodeURIComponent(shareURL)}';
    window.open(messengerURL, "_blank");
});
document.getElementById("share-facebook").addEventListener("click", () => {
    const facebookURL = 'https://www.facebook.com/sharer.php?u=$encodeURIComponent(shareURL)}';
    window.open(facebookURL, "_blank");
});