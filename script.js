/* 
   LOGIKA INTERAKSI MORIGIN
   Dibuat khusus untuk Tuan oleh BABU JODIE 
*/

document.addEventListener('DOMContentLoaded', () => {
    const treeImg = document.getElementById('moringa-img');
    const stageText = document.getElementById('stage-text');
    const treeContainer = document.getElementById('tree-stage');

    // 1. FUNGSI UTAMA: ANIMASI PERTUMBUHAN (SCROLL-BASED)
    window.addEventListener('scroll', () => {
        // Menghitung persentase scroll pada section Hero saja (agar lebih sensitif)
        const scrollY = window.scrollY;
        const triggerPoint = 400; // Titik di mana pohon sudah harus besar
        
        let scale = 1 + (scrollY / 500); // Pohon membesar perlahan
        let opacity = 1;
        
        // Batas maksimal pembesaran
        if (scale > 1.8) scale = 1.8;

        // Logika Pergantian Tahap Pertumbuhan
        if (scrollY < 150) {
            // TAHAP 1: BIBIT
            treeImg.src = "https://cdn-icons-png.flaticon.com/512/628/628283.png"; 
            stageText.innerText = "Tahap 1: Bibit Unggul";
            stageText.style.color = "#16a34a";
        } 
        else if (scrollY >= 150 && scrollY < 350) {
            // TAHAP 2: TUNAS (Ada efek transisi halus)
            treeImg.src = "https://cdn-icons-png.flaticon.com/512/892/892926.png";
            stageText.innerText = "Tahap 2: Tunas Harapan";
            stageText.style.color = "#22c55e";
        } 
        else if (scrollY >= 350) {
            // TAHAP 3: POHON RINDANG
            treeImg.src = "https://cdn-icons-png.flaticon.com/512/489/489969.png";
            stageText.innerText = "Tahap 3: Pohon Keajaiban";
            stageText.style.color = "#15803d";
            treeImg.classList.add('pohon-berbuah'); // Menambahkan efek glow dari CSS
        }

        // Terapkan Transformasi Scale dan Rotasi tipis agar lebih dinamis
        treeImg.style.transform = `scale(${scale}) rotate(${scrollY / 50}deg)`;
    });

    // 2. LOGIKA MODAL PEMBAYARAN QRIS
    window.openPayment = function(product, price) {
        const modal = document.getElementById('payment-modal');
        document.getElementById('checkout-product').innerText = product;
        document.getElementById('checkout-price').innerText = "Rp " + price.toLocaleString('id-ID');
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closePayment = function() {
        const modal = document.getElementById('payment-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // 3. SIMULASI PEMBAYARAN BERHASIL (INTERAKSI KHUSUS)
    window.simulateSuccess = function() {
        const modalContent = document.querySelector('#payment-modal > div');
        
        // Ganti isi modal dengan animasi sukses
        modalContent.innerHTML = `
            <div class="py-10 animate-bounce">
                <i class="fa-solid fa-circle-check text-8xl text-green-500 mb-6"></i>
                <h2 class="text-2xl font-bold text-slate-800">Pembayaran Berhasil!</h2>
                <p class="mt-4 text-slate-500 leading-relaxed">Terima kasih Tuan!<br>Produk <b>Morigin</b> sedang kami siapkan untuk dikirim.</p>
                <button onclick="location.reload()" class="mt-8 bg-green-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-green-700 transition">Selesai</button>
            </div>
        `;

        // Tambahkan efek konfeti sederhana jika Tuan mau (opsional)
        console.log("Status: Payment Settled. Triggering Growth Animation.");
    };
});