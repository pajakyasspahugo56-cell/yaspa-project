// ====== GANTI DENGAN URL WEB APP DEPLOYMENT TERBARU ANDA ======
const API_URL = 'https://script.google.com/macros/s/AKfycbzamdzE76MHfToXebRsPZ8DI7l62GFuhu2AdglJlmORP8LlIMfJijrmjVuja2Iw7N7fxQ/exec'; 
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
let dataTableInstance = null;

// Fungsi Render Tabel dengan DataTables
function renderTable() {
    // Hancurkan instance DataTables sebelumnya jika sudah ada
    if (dataTableInstance) {
        dataTableInstance.destroy();
    }

    tabelBody.innerHTML = '';

    currentData.forEach((pegawai) => {
        const rowData = JSON.stringify(pegawai).replace(/"/g, '&quot;');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${pegawai.no || ''}</td>
            <td class="fw-semibold">${pegawai.nama || ''}</td>
            <td>${pegawai.posisi || ''}</td>
            <td>${pegawai.status_pegawai || ''}</td>
            <td class="text-center">${pegawai.tk || ''}</td>
            <td class="text-center">${pegawai.gol || ''}</td>
            <td class="text-center">${pegawai.id_tku || ''}</td>
            <td>${pegawai.unit || ''}</td>
            <td>${pegawai.npwp || ''}</td>
            <td class="text-center">${pegawai.kode_pajak || ''}</td>
            <td class="text-end fw-semibold text-primary">${formatRupiah(pegawai.gaji)}</td>
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

    // Inisialisasi Ulang DataTables dengan Fitur Ekspor & Pencarian
    dataTableInstance = $('#dataTablePegawai').DataTable({
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Cari pegawai...",
            lengthMenu: "Tampilkan _MENU_ data",
            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
            paginate: {
                previous: '<i class="fas fa-chevron-left"></i>',
                next: '<i class="fas fa-chevron-right"></i>'
            }
        },
        dom: '<"d-flex flex-wrap justify-content-between align-items-center mb-3"Bf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-3"ip>',
        buttons: [
            { extend: 'copy', className: 'btn btn-sm btn-outline-secondary', text: '<i class="fas fa-copy me-1"></i> Copy' },
            { extend: 'csv', className: 'btn btn-sm btn-outline-info', text: '<i class="fas fa-file-csv me-1"></i> CSV' },
            { extend: 'excel', className: 'btn btn-sm btn-outline-success', text: '<i class="fas fa-file-excel me-1"></i> Excel' },
            { extend: 'pdf', className: 'btn btn-sm btn-outline-danger', text: '<i class="fas fa-file-pdf me-1"></i> PDF' }
        ],
        pageLength: 10,
        responsive: true
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
        posisi: document.getElementById('posisi').value,
        status_pegawai: document.getElementById('status_pegawai').value,
        tk: document.getElementById('tk').value,
        gol: document.getElementById('gol').value,
        id_tku: document.getElementById('id_tku').value,
        unit: document.getElementById('unit').value,
        npwp: document.getElementById('npwp').value,
        kode_pajak: document.getElementById('kode_pajak').value,
        gaji: document.getElementById('gaji').value
    };

    const payload = {
        action: record.row ? 'update' : 'create',
        record: record
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
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
        alert('Terjadi kesalahan jaringan saat menyimpan.');
    } finally {
        hideLoading();
    }
});

// Fungsi Edit (Isi Form)
function editData(pegawai) {
    document.getElementById('rowId').value = pegawai.row;
    document.getElementById('noUrut').value = pegawai.no;
    document.getElementById('nama').value = pegawai.nama;
    document.getElementById('posisi').value = pegawai.posisi || '';
    document.getElementById('status_pegawai').value = pegawai.status_pegawai || '';
    document.getElementById('tk').value = pegawai.tk || '';
    document.getElementById('gol').value = pegawai.gol || '';
    document.getElementById('id_tku').value = pegawai.id_tku || '';
    document.getElementById('unit').value = pegawai.unit || '';
    document.getElementById('npwp').value = pegawai.npwp || '';
    document.getElementById('kode_pajak').value = pegawai.kode_pajak || '';
    document.getElementById('gaji').value = pegawai.gaji || '';
    
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
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
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
            alert('Terjadi kesalahan jaringan saat menghapus.');
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