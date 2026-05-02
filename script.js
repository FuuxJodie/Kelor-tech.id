/* 
   LOGIKA INTERAKSI MORIGIN - EDUCOMMERCE NEXT LEVEL
   Update: Mandatory Login, QRIS Simulation, & Global Animations
   Dibuat khusus untuk Tuan oleh BABU JODIE 
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INISIALISASI DATA & STATE ---
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let isLoginMode = true; 
    const treeImg = document.getElementById('moringa-img');
    const cartModal = document.getElementById('cart-modal');
    const qrisModal = document.getElementById('qris-modal');
    const authModal = document.getElementById('auth-modal');
    const orderStatus = document.getElementById('order-status');
    let qrisCountdown;

    // --- 2. AUTH SYSTEM LOGIC (GERBANG MASUK) ---
    
    window.openAuth = function() {
        if(authModal) {
            authModal.classList.remove("hidden");
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeAuth = function() {
        if(authModal) {
            authModal.classList.add("hidden");
            document.body.style.overflow = 'auto';
        }
    };

    window.toggleAuth = function() {
        isLoginMode = !isLoginMode;
        document.getElementById("auth-title").innerText = isLoginMode ? "Login" : "Register";
        document.querySelector("#auth-modal button[onclick='submitAuth()']").innerText = isLoginMode ? "Masuk" : "Daftar";
        document.getElementById("toggle-text").innerText = isLoginMode ? "Belum punya akun?" : "Sudah punya akun?";
    };

    window.submitAuth = function() {
        const username = document.getElementById("auth-username").value;
        const password = document.getElementById("auth-password").value;

        if (!username || !password) {
            alert("Mohon lengkapi data Tuan!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (isLoginMode) {
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) {
                alert("Username atau Password salah, Tuan.");
                return;
            }
            localStorage.setItem("currentUser", JSON.stringify(user));
            showStatus(`Selamat datang kembali, ${username}!`);
        } else {
            const exists = users.find(u => u.username === username);
            if (exists) {
                alert("Username sudah terdaftar!");
                return;
            }
            users.push({ username, password });
            localStorage.setItem("users", JSON.stringify(users));
            alert("Akun berhasil dibuat! Silakan Login.");
            toggleAuth();
            return;
        }

        closeAuth();
        updateUserUI();
    };

    window.updateUserUI = function() {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        const btn = document.getElementById("user-btn");
        if (!btn) return;

        if (user) {
            btn.innerText = user.username;
            btn.onclick = logout;
            btn.classList.add("bg-green-600", "text-white"); 
        } else {
            btn.innerText = "Login";
            btn.onclick = openAuth;
            btn.classList.remove("bg-green-600", "text-white");
        }
    };

    window.logout = function() {
        if(confirm("Tuan ingin keluar?")) {
            localStorage.removeItem("currentUser");
            showStatus("Logout berhasil.");
            updateUserUI();
        }
    };

    // --- 3. KERANJANG BELANJA (LOGIC & UI) ---
    
    window.addToCart = function(name, price) {
        const user = localStorage.getItem("currentUser");
        
        // Proteksi: Harus login sebelum belanja
        if (!user) {
            alert("Silakan login terlebih dahulu untuk memasukkan produk ke keranjang, Tuan!");
            openAuth();
            return;
        }

        let item = cart.find(i => i.name === name);
        if (item) {
            item.qty++;
        } else {
            cart.push({ name, price, qty: 1 });
        }
        
        saveCart();
        renderCart();
        updateCartCount();
        showStatus(`Menambahkan ${name} ke keranjang...`);
    };

    window.updateCartCount = function() {
        const count = cart.reduce((total, item) => total + item.qty, 0);
        const countElement = document.getElementById("cart-count");
        if (countElement) countElement.innerText = count;
        updateRecommendation(); 
    };

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function renderCart() {
        const container = document.getElementById("cart-items");
        const totalElement = document.getElementById("total");
        if (!container) return;

        container.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.qty;
            container.innerHTML += `
                <div class="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                        <p class="font-bold text-sm text-slate-800">${item.name}</p>
                        <p class="text-xs text-slate-500">${item.qty}x - Rp ${item.price.toLocaleString()}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 transition">
                        <i class="fa fa-trash-can"></i>
                    </button>
                </div>
            `;
        });
        if(totalElement) totalElement.innerText = `Rp ${total.toLocaleString()}`;
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
        updateCartCount();
    };

    // --- 4. CHECKOUT & QRIS SYSTEM ---
    
    window.openCart = function() {
        renderCart();
        if(cartModal) cartModal.classList.remove('hidden');
    };

    window.closeCart = function() {
        if(cartModal) cartModal.classList.add('hidden');
    };

    window.checkout = function() {
        if (cart.length === 0) {
            alert("Keranjang Tuan masih kosong!");
            return;
        }
        
        closeCart();
        if(qrisModal) qrisModal.classList.remove('hidden');
        
        const loader = document.getElementById('qris-loader');
        if (loader) {
            loader.style.opacity = "1";
            setTimeout(() => { 
                loader.style.opacity = "0"; 
                loader.style.pointerEvents = "none"; 
            }, 1500);
        }
        startQrisTimer();
    };

    function startQrisTimer() {
        let timeLeft = 300; // 5 Menit
        const timerDisplay = document.getElementById('qris-timer');
        if (qrisCountdown) clearInterval(qrisCountdown);
        qrisCountdown = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            if (timerDisplay) timerDisplay.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft <= 0) {
                clearInterval(qrisCountdown);
                if(qrisModal) qrisModal.classList.add('hidden');
                alert("Waktu pembayaran habis.");
            }
            timeLeft--;
        }, 1000);
    }

    window.simulatePaymentSuccess = function() {
        clearInterval(qrisCountdown);
        const container = document.getElementById('qris-container');
        if (container) {
            container.innerHTML = `
                <div class="py-10 text-center">
                    <i class="fa-solid fa-circle-check text-7xl text-green-500 animate-bounce"></i>
                    <h2 class="font-bold text-2xl mt-6">Pembayaran Berhasil!</h2>
                    <p class="text-slate-500 text-sm mt-2">Pesanan Tuan sedang kami proses.</p>
                    <button onclick="location.reload()" class="mt-8 px-10 py-3 bg-green-600 text-white rounded-2xl font-bold">Selesai</button>
                </div>`;
        }
        cart = [];
        saveCart();
        updateCartCount();
    };

    // --- 5. VISUAL EFFECTS & SMART RECOMMENDATION ---
    
    // Parallax Effect di Hero
    document.addEventListener('mousemove', (e) => {
        if (treeImg) {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
            treeImg.style.transform = `translate(${moveX}px, ${moveY}px) rotate(-5deg)`;
        }
    });

    function updateRecommendation() {
        const recBox = document.getElementById("recommendation");
        if (!recBox) return;
        const namesInCart = cart.map(item => item.name);
        let advice = "Tuan, yuk mulai hidup sehat dengan produk Keloravita!";
        if (namesInCart.length > 0) {
            if (namesInCart.includes('Morigin') && !namesInCart.includes('Stik Mori')) {
                advice = "Saran BABU JODIE: <b>Stik Mori</b> pas untuk teman ngemil Tuan!";
            } else if (namesInCart.length >= 3) {
                advice = "Pilihan cerdas! Segera Checkout untuk klaim bonusnya.";
            }
        }
        recBox.innerHTML = `<i class="fa-solid fa-lightbulb animate-pulse mr-3 text-yellow-500"></i> ${advice}`;
    }

    function showStatus(text) {
        if (!orderStatus) {
            alert(text);
            return;
        }
        const statusText = document.getElementById("status-text");
        if (statusText) statusText.innerText = text;
        orderStatus.classList.remove('hidden');
        setTimeout(() => orderStatus.classList.add('hidden'), 3000);
    }

    // --- 6. INITIAL RUN ---
    updateCartCount();
    renderCart();
    updateUserUI();
});

// --- 7. NAV DROPDOWN LOGIC ---
window.toggleMenu = function() {
    const menu = document.getElementById("menu-dropdown");
    if (menu) menu.classList.toggle("hidden");
};

document.addEventListener("click", function(e) {
    const menu = document.getElementById("menu-dropdown");
    const btn = document.querySelector("[onclick='toggleMenu()']");
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add("hidden");
    }
});

// --- 8. GLOBAL SCROLL ANIMATION ---
const sections = document.querySelectorAll(".section");
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.15 });

sections.forEach(sec => observer.observe(sec));

// --- 9. COUNTER IMPACT (SDGs) ANIMATION ---
function animateCounter(id, target) {
    let el = document.getElementById(id);
    if (!el) return;
    let count = 0;
    let interval = setInterval(() => {
        count += Math.ceil(target / 50);
        if (count >= target) {
            count = target;
            clearInterval(interval);
        }
        el.innerText = count;
    }, 30);
}

const impactSection = document.getElementById("impact");
if (impactSection) {
    const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateCounter("counter1", 500); // Target SDGs
            animateCounter("counter2", 1200);
            animateCounter("counter3", 300);
            obs.disconnect();
        }
    });
    obs.observe(impactSection);
}