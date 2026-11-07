// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  const formTamu = document.getElementById("formTamu");
  const tbodyTamu = document.getElementById("tbodyTamu");
  const alertBox = document.getElementById("alertBox");
  const totalCount = document.getElementById("totalCount");
  const btnSubmit = document.getElementById("btnSubmit");

  // Sumber data awal tetap melalui berkas JSON statis
  const DATA_URL = "data/buku_tamu.json";

  // Variabel penampung data di memori (tersimpan sesaat / client-side)
  let daftarTamu = [];

  // Fungsi menampilkan notifikasi
  function showAlert(message, type = "success") {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    setTimeout(() => {
      alertBox.className = "alert";
    }, 4000);
  }

  // Escape HTML untuk mencegah XSS saat render
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Format tanggal & jam saat ini (YYYY-MM-DD HH:mm:ss)
  function getFormatWaktuSekarang() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const ii = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${ii}:${ss}`;
  }

  // Generator ID unik client-side (format: GT-XXXXXXXX)
  function generateIdTamu() {
    const randomHex = Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0")
      .toUpperCase();
    return `GT-${randomHex}`;
  }

  // 1. Pemanggilan data tetap melalui file data/buku_tamu.json
  async function muatBukuTamu() {
    try {
      // Menggunakan cache-buster agar selalu memuat data terbaru dari berkas JSON
      const response = await fetch(`${DATA_URL}?_=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error("Gagal memuat data buku tamu");
      }

      const data = await response.json();
      daftarTamu = Array.isArray(data) ? data : [];
      renderTabel(daftarTamu);
    } catch (error) {
      console.error("Error saat fetch buku_tamu.json:", error);
      tbodyTamu.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            Belum ada data atau gagal memuat data (${error.message}).
          </td>
        </tr>
      `;
      if (totalCount) totalCount.textContent = "0 Tamu";
    }
  }

  // 2. Render data ke dalam tabel
  function renderTabel(data) {
    if (!Array.isArray(data) || data.length === 0) {
      tbodyTamu.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">Belum ada catatan tamu. Silakan isi form di samping.</td>
        </tr>
      `;
      if (totalCount) totalCount.textContent = "0 Tamu";
      return;
    }

    if (totalCount) {
      totalCount.textContent = `${data.length} Tamu`;
    }

    // Urutkan data dari yang paling baru (data paling akhir ditambahkan berada di baris teratas)
    const dataUrut = [...data].reverse();

    tbodyTamu.innerHTML = dataUrut
      .map((tamu) => {
        return `
          <tr>
            <td><strong>${escapeHtml(tamu.nama || "-")}</strong></td>
            <td>${escapeHtml(tamu.instansi || "-")}</td>
            <td>${escapeHtml(tamu.keperluan || "-")}</td>
            <td class="text-time">${escapeHtml(tamu.waktu || "-")}</td>
          </tr>
        `;
      })
      .join("");
  }

  // 3. Handle Submit Form (Tersimpan sesaat di memori, tanpa API / json_store)
  formTamu.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const instansi = document.getElementById("instansi").value.trim();
    const keperluan = document.getElementById("keperluan").value.trim();

    if (!nama || !instansi || !keperluan) {
      showAlert("Mohon lengkapi semua isian formulir!", "error");
      return;
    }

    // Buat objek data baru secara instan di sisi klien
    const dataBaru = {
      id: generateIdTamu(),
      nama: nama,
      instansi: instansi,
      keperluan: keperluan,
      waktu: getFormatWaktuSekarang(),
    };

    // Simpan sesaat ke array memori aktif
    daftarTamu.push(dataBaru);

    // Render ulang tabel secara instan
    renderTabel(daftarTamu);

    // Reset formulir input
    formTamu.reset();

    // Tampilkan notifikasi berhasil
    showAlert("Data tamu berhasil ditambahkan (tersimpan sesaat)!", "success");
  });

  // Pemuatan awal data dari data/buku_tamu.json
  muatBukuTamu();
});
