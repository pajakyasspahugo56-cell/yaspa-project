// ====== GANTI DENGAN URL WEB APP DEPLOYMENT ANDA ======
const API_URL = 'https://script.google.com/macros/s/AKfycbzamdzE76MHfToXebRsPZ8DI7l62GFuhu2AdglJlmORP8LlIMfJijrmjVuja2Iw7N7fxQ/exec'; 
// Contoh: 'https://script.google.com/macros/s/AKfycby.../exec'
// =======================================================


// Referensi DOM
const form = document.getElementById('formPegawai');
const tabelBody = document.getElementById('tabelPegawai');
const loadingOverlay = document.getElementById('loadingOverlay');

let currentData = [];

// Format mata uang Rupiah
const formatRupiah = (angka) => {
    if (!angka || isNaN(angka)) return '';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
};

// Toggle Loading UI
const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

// Fungsi Read (GET)
async function loadData() {
    showLoading();
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.status === "success") {
            currentData = result.data;
            renderTable();
        } else {
            alert('Gagal memuat data: ' + result.message);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Terjadi kesalahan jaringan.');
    } finally {
        hideLoading();
    }
}

// Fungsi Render Tabel
function renderTable() {
    tabelBody.innerHTML = '';
    
    if (currentData.length === 0) {
        tabelBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Tidak ada data di Spreadsheet</td></tr>';
        return;
    }

    currentData.forEach((pegawai) => {
        // Melakukan stringify lalu sanitize agar bisa dikirim ke fungsi onclick
        const rowData = JSON.stringify(pegawai).replace(/"/g, '&quot;');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${pegawai.no || ''}</td>
            <td>${pegawai.nama || ''}</td>
            <td class="text-center">${pegawai.tk || ''}</td>
            <td class="text-center">${pegawai.gol || ''}</td>
            <td class="text-center">${pegawai.id || ''}</td>
            <td>${pegawai.npwp || ''}</td>
            <td class="text-end">${formatRupiah(pegawai.gaji)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning action-btn text-white me-1" onclick='editData(${rowData})' title="Edit">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-danger action-btn" onclick="hapusData(${pegawai.row})" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabelBody.appendChild(row);
    });
}

// Event Listener Submit (Create/Update POST)
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    showLoading();

    const record = {
        row: document.getElementById('rowId').value,
        no: document.getElementById('noUrut').value,
        nama: document.getElementById('nama').value,
        tk: document.getElementById('tk').value,
        gol: document.getElementById('gol').value,
        id: document.getElementById('idPegawai').value,
        npwp: document.getElementById('npwp').value,
        gaji: document.getElementById('gaji').value
    };

    const payload = {
        action: record.row ? 'update' : 'create',
        record: record
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if (result.status === "success") {
            currentData = result.data;
            renderTable();
            resetForm();
        } else {
            alert('Gagal menyimpan: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Terjadi kesalahan jaringan.');
    } finally {
        hideLoading();
    }
});

// Fungsi Edit (Isi Form)
function editData(pegawai) {
    document.getElementById('rowId').value = pegawai.row;
    document.getElementById('noUrut').value = pegawai.no;
    document.getElementById('nama').value = pegawai.nama;
    document.getElementById('tk').value = pegawai.tk;
    document.getElementById('gol').value = pegawai.gol;
    document.getElementById('idPegawai').value = pegawai.id;
    document.getElementById('npwp').value = pegawai.npwp;
    document.getElementById('gaji').value = pegawai.gaji;
    
    document.getElementById('formTitle').innerText = 'Perbarui Data Pegawai';
    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.innerHTML = '<i class="fas fa-sync me-1"></i> Perbarui Sheets';
    btnSubmit.classList.replace('btn-primary', 'btn-success');
}

// Fungsi Delete (POST)
async function hapusData(row) {
    if (confirm('Yakin ingin menghapus baris data ini langsung dari Spreadsheet?')) {
        showLoading();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete', row: row })
            });
            const result = await response.json();
            
            if (result.status === "success") {
                currentData = result.data;
                renderTable();
            } else {
                alert('Gagal menghapus: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            alert('Terjadi kesalahan jaringan.');
        } finally {
            hideLoading();
        }
    }
}

// Utilitas Reset Form
function resetForm() {
    form.reset();
    document.getElementById('rowId').value = '';
    document.getElementById('noUrut').value = '';
    document.getElementById('formTitle').innerText = 'Tambah Pegawai Baru';
    
    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.innerHTML = '<i class="fas fa-save me-1"></i> Simpan ke Sheets';
    btnSubmit.classList.replace('btn-success', 'btn-primary');
}

// Load data saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", loadData);