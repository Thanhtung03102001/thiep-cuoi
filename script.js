"use strict";

const CONFIG = {
    password: "6310",
    birthDate: "2020-08-27T00:00:00",
    loadingTime: 2300
};

document.addEventListener("DOMContentLoaded", () => {
    const screens = Array.from(
        document.querySelectorAll(".screen")
    );

    const dots = Array.from(
        document.querySelectorAll("#pinDots i")
    );

    const pinDots =
        document.getElementById("pinDots");

    const lockCard =
        document.querySelector(".lock-card");

    const errorMessage =
        document.getElementById("errorMessage");

    const canvas =
        document.getElementById("effects");

    const context =
        canvas ? canvas.getContext("2d") : null;

    let pin = "";
    let audioContext = null;
    let soundEnabled = false;
    let particles = [];

    function getElement(id) {
        return document.getElementById(id);
    }

    /*
      Chuyển màn hình
    */

    function showScreen(id) {
        screens.forEach((screen) => {
            screen.classList.toggle(
                "active",
                screen.id === id
            );
        });

        const target = getElement(id);

        if (target) {
            target.scrollTop = 0;
        }

        if (id !== "lockScreen") {
            burst(
                window.innerWidth / 2,
                window.innerHeight / 2,
                32
            );
        }
    }

    /*
      Tạo âm thanh bấm nhẹ
    */

    function playTone(frequency, duration) {
        if (!soundEnabled) {
            return;
        }

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return;
        }

        try {
            audioContext =
                audioContext ||
                new AudioContextClass();

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(
                0.045,
                audioContext.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start();

            oscillator.stop(
                audioContext.currentTime + duration
            );
        } catch (error) {
            console.warn(
                "Không thể phát âm thanh:",
                error
            );
        }
    }

    /*
      Cập nhật chấm mật mã
    */

    function updatePin() {
        dots.forEach((dot, index) => {
            dot.classList.toggle(
                "filled",
                index < pin.length
            );
        });

        if (pinDots) {
            pinDots.setAttribute(
                "aria-label",
                `Đã nhập ${pin.length} trên 4 số`
            );
        }

        if (pin.length === 4) {
            window.setTimeout(
                checkPin,
                120
            );
        }
    }

    /*
      Kiểm tra mật mã
    */

    function checkPin() {
        if (pin === CONFIG.password) {
            playTone(520, 0.12);

            showScreen("loadingScreen");

            window.setTimeout(() => {
                showScreen("introScreen");
            }, CONFIG.loadingTime);

            return;
        }

        if (errorMessage) {
            errorMessage.classList.add("show");
        }

        if (lockCard) {
            lockCard.classList.add("shake");
        }

        playTone(130, 0.18);

        window.setTimeout(() => {
            pin = "";
            updatePin();

            if (lockCard) {
                lockCard.classList.remove("shake");
            }
        }, 450);
    }

    /*
      Các phím số
    */

    document
        .querySelectorAll("[data-key]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                if (pin.length >= 4) {
                    return;
                }

                if (errorMessage) {
                    errorMessage.classList.remove("show");
                }

                pin += button.dataset.key;

                playTone(
                    260 + Number(button.dataset.key) * 18,
                    0.045
                );

                updatePin();
            });
        });

    /*
      Nút xóa
    */

    const deleteButton =
        getElement("deleteButton");

    if (deleteButton) {
        deleteButton.addEventListener(
            "click",
            () => {
                pin = pin.slice(0, -1);
                updatePin();
            }
        );
    }

    /*
      Gợi ý mật mã
    */

    const hintButton =
        getElement("hintButton");

    const hint =
        getElement("hint");

    if (hintButton && hint) {
        hintButton.addEventListener(
            "click",
            () => {
                hint.classList.toggle("show");
            }
        );
    }

    /*
      Nút chuyển màn hình
    */

    document
        .querySelectorAll("[data-next]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                showScreen(button.dataset.next);
            });
        });

    /*
      Nhạc nền
    */

    const soundButton =
        getElement("soundButton");

    const backgroundMusic =
        getElement("backgroundMusic");

    function updateSoundButton() {
        if (!soundButton) {
            return;
        }

        soundButton.classList.toggle(
            "muted",
            !soundEnabled
        );

        soundButton.textContent =
            soundEnabled ? "♫" : "♪";

        soundButton.setAttribute(
            "aria-pressed",
            String(soundEnabled)
        );

        soundButton.setAttribute(
            "aria-label",
            soundEnabled
                ? "Tắt nhạc"
                : "Bật nhạc"
        );
    }

    if (soundButton && backgroundMusic) {
        soundButton.addEventListener(
            "click",
            async () => {
                if (backgroundMusic.paused) {
                    try {
                        await backgroundMusic.play();
                        soundEnabled = true;
                    } catch (error) {
                        soundEnabled = false;

                        console.warn(
                            "Không thể phát nhạc:",
                            error
                        );
                    }
                } else {
                    backgroundMusic.pause();
                    soundEnabled = false;
                }

                updateSoundButton();
            }
        );

        backgroundMusic.addEventListener(
            "error",
            () => {
                soundEnabled = false;
                updateSoundButton();
            }
        );

        backgroundMusic.volume = 0.55;
        updateSoundButton();
    }

    /*
      Tính tuổi
    */

    function calculateAge() {
        const birth =
            new Date(CONFIG.birthDate);

        const now =
            new Date();

        let years =
            now.getFullYear() -
            birth.getFullYear();

        let months =
            now.getMonth() -
            birth.getMonth();

        let days =
            now.getDate() -
            birth.getDate();

        if (days < 0) {
            months -= 1;

            days += new Date(
                now.getFullYear(),
                now.getMonth(),
                0
            ).getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        const yearsElement =
            getElement("years");

        const monthsElement =
            getElement("months");

        const daysElement =
            getElement("days");

        const label =
            getElement("birthDateLabel");

        if (yearsElement) {
            yearsElement.textContent =
                String(years).padStart(2, "0");
        }

        if (monthsElement) {
            monthsElement.textContent =
                String(months).padStart(2, "0");
        }

        if (daysElement) {
            daysElement.textContent =
                String(days).padStart(2, "0");
        }

        if (label) {
            label.textContent =
                birth.toLocaleDateString(
                    "vi-VN",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    }
                );
        }
    }

    calculateAge();

    /*
      CAROUSEL ALBUM ẢNH
  
      Mỗi ô có 3 ảnh.
      Có thể vuốt ngang hoặc bấm nút trái/phải.
    */

    document
        .querySelectorAll("[data-carousel]")
        .forEach((carousel) => {
            const track =
                carousel.querySelector(
                    ".photo-track"
                );

            const slides =
                Array.from(
                    carousel.querySelectorAll(
                        ".photo-card"
                    )
                );

            const dotsWrap =
                carousel.querySelector(
                    ".carousel-dots"
                );

            const previousButton =
                carousel.querySelector(".prev");

            const nextButton =
                carousel.querySelector(".next");

            let activeIndex = 0;
            let scrollTimer = null;

            if (
                !track ||
                slides.length === 0 ||
                !dotsWrap
            ) {
                return;
            }

            /*
              Tạo các chấm chỉ báo ảnh
            */

            const dotButtons =
                slides.map((slide, index) => {
                    const dot =
                        document.createElement("button");

                    dot.type = "button";

                    dot.setAttribute(
                        "aria-label",
                        `Xem ảnh ${index + 1}`
                    );

                    dot.addEventListener(
                        "click",
                        () => {
                            goToSlide(index);
                        }
                    );

                    dotsWrap.appendChild(dot);

                    return dot;
                });

            /*
              Cập nhật chấm đang được chọn
            */

            function renderDots() {
                dotButtons.forEach(
                    (dot, index) => {
                        dot.classList.toggle(
                            "active",
                            index === activeIndex
                        );

                        dot.setAttribute(
                            "aria-current",
                            index === activeIndex
                                ? "true"
                                : "false"
                        );
                    }
                );
            }

            /*
              Chuyển đến một ảnh
            */

            function goToSlide(index) {
                activeIndex =
                    (index + slides.length) %
                    slides.length;

                track.scrollTo({
                    left:
                        activeIndex *
                        track.clientWidth,

                    behavior: "smooth"
                });

                renderDots();
            }

            /*
              Nút ảnh trước
            */

            if (previousButton) {
                previousButton.addEventListener(
                    "click",
                    () => {
                        goToSlide(activeIndex - 1);
                    }
                );
            }

            /*
              Nút ảnh sau
            */

            if (nextButton) {
                nextButton.addEventListener(
                    "click",
                    () => {
                        goToSlide(activeIndex + 1);
                    }
                );
            }

            /*
              Cập nhật chấm khi người dùng vuốt
            */

            track.addEventListener(
                "scroll",
                () => {
                    window.clearTimeout(scrollTimer);

                    scrollTimer =
                        window.setTimeout(() => {
                            activeIndex = Math.round(
                                track.scrollLeft /
                                Math.max(
                                    track.clientWidth,
                                    1
                                )
                            );

                            renderDots();
                        }, 70);
                },
                {
                    passive: true
                }
            );

            renderDots();
        });

    /*
      Phóng to ảnh khi chạm
    */

    const dialog =
        getElement("photoDialog");

    document
        .querySelectorAll(".photo-card")
        .forEach((card) => {
            card.addEventListener(
                "click",
                () => {
                    if (
                        !dialog ||
                        typeof dialog.showModal !==
                        "function"
                    ) {
                        return;
                    }

                    const sourceImage =
                        card.querySelector("img");

                    const dialogImage =
                        getElement("dialogImage");

                    const dialogCaption =
                        getElement("dialogCaption");

                    if (
                        !sourceImage ||
                        !dialogImage
                    ) {
                        return;
                    }

                    dialogImage.src =
                        sourceImage.src;

                    dialogImage.alt =
                        sourceImage.alt;

                    if (dialogCaption) {
                        dialogCaption.textContent =
                            card.dataset.caption || "";
                    }

                    dialog.showModal();
                }
            );
        });

    /*
      Đóng hộp ảnh
    */

    const closeDialog =
        getElement("closeDialog");

    if (closeDialog && dialog) {
        closeDialog.addEventListener(
            "click",
            () => {
                dialog.close();
            }
        );

        dialog.addEventListener(
            "click",
            (event) => {
                if (event.target === dialog) {
                    dialog.close();
                }
            }
        );
    }

    /*
      Mở phong thư
    */

    const envelope =
        getElement("envelope");

    const letter =
        getElement("letter");

    const tapNote =
        getElement("tapNote");

    if (envelope) {
        envelope.addEventListener(
            "click",
            () => {
                envelope.classList.add("open");

                if (tapNote) {
                    tapNote.style.opacity = "0";
                }

                playTone(620, 0.25);

                window.setTimeout(() => {
                    envelope.style.display = "none";

                    if (letter) {
                        letter.classList.add("show");
                    }

                    burst(
                        window.innerWidth / 2,
                        window.innerHeight * 0.35,
                        50
                    );
                }, 850);
            }
        );
    }

    /*
      Xem lại từ đầu
    */

    const replayButton =
        getElement("replayButton");

    if (replayButton) {
        replayButton.addEventListener(
            "click",
            () => {
                pin = "";
                updatePin();

                if (letter) {
                    letter.classList.remove("show");
                }

                if (envelope) {
                    envelope.style.display =
                        "inline-block";

                    envelope.classList.remove("open");
                }

                if (tapNote) {
                    tapNote.style.opacity = "1";
                }

                showScreen("lockScreen");
            }
        );
    }

    /*
      Hiệu ứng tim và hạt
    */

    function resizeCanvas() {
        if (!canvas || !context) {
            return;
        }

        const ratio =
            window.devicePixelRatio || 1;

        canvas.width =
            window.innerWidth * ratio;

        canvas.height =
            window.innerHeight * ratio;

        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );
    }

    function burst(
        x,
        y,
        count = 24
    ) {
        if (
            !context ||
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }

        const colors = [
            "#e52746",
            "#ff8da0",
            "#fff5ef",
            "#8f1029"
        ];

        for (
            let index = 0;
            index < count;
            index += 1
        ) {
            particles.push({
                x: x,
                y: y,

                vx:
                    (Math.random() - 0.5) *
                    8,

                vy:
                    (Math.random() - 1.1) *
                    7,

                gravity: 0.11,

                size:
                    3 +
                    Math.random() *
                    6,

                color:
                    colors[
                    index % colors.length
                    ],

                life: 1,

                shape:
                    Math.random() > 0.45
                        ? "heart"
                        : "dot"
            });
        }
    }

    function drawHeart(
        x,
        y,
        size
    ) {
        context.beginPath();

        context.moveTo(
            x,
            y + size * 0.3
        );

        context.bezierCurveTo(
            x - size,
            y - size * 0.4,
            x - size * 0.55,
            y - size,
            x,
            y - size * 0.45
        );

        context.bezierCurveTo(
            x + size * 0.55,
            y - size,
            x + size,
            y - size * 0.4,
            x,
            y + size * 0.3
        );

        context.fill();
    }

    function animate() {
        if (!context) {
            return;
        }

        context.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        particles =
            particles.filter(
                (particle) =>
                    particle.life > 0
            );

        particles.forEach(
            (particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                particle.vy +=
                    particle.gravity;

                particle.life -= 0.012;

                context.globalAlpha =
                    Math.max(
                        particle.life,
                        0
                    );

                context.fillStyle =
                    particle.color;

                if (
                    particle.shape === "heart"
                ) {
                    drawHeart(
                        particle.x,
                        particle.y,
                        particle.size
                    );
                } else {
                    context.fillRect(
                        particle.x,
                        particle.y,
                        particle.size,
                        particle.size
                    );
                }
            }
        );

        context.globalAlpha = 1;

        window.requestAnimationFrame(
            animate
        );
    }

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    resizeCanvas();
    animate();

    /*
      Hiện tim tại vị trí người dùng chạm
    */

    window.addEventListener(
        "pointerdown",
        (event) => {
            const activeScreen =
                document.querySelector(
                    ".screen.active"
                );

            if (
                !event.target.closest("button") &&
                activeScreen &&
                activeScreen.id !== "lockScreen"
            ) {
                burst(
                    event.clientX,
                    event.clientY,
                    8
                );
            }
        }
    );

    /*
      Nhập mật mã bằng bàn phím máy tính
    */

    document.addEventListener(
        "keydown",
        (event) => {
            const lockScreen =
                getElement("lockScreen");

            if (
                !lockScreen ||
                !lockScreen.classList.contains(
                    "active"
                )
            ) {
                return;
            }

            if (
                /^\d$/.test(event.key) &&
                pin.length < 4
            ) {
                pin += event.key;
                updatePin();
            } else if (
                event.key === "Backspace"
            ) {
                pin =
                    pin.slice(0, -1);

                updatePin();
            }
        }
    );
});