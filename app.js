// ====== GANTI DENGAN URL WEB APP DEPLOYMENT TERBARU ======
const API_URL = 'https://script.google.com/macros/s/AKfycbzamdzE76MHfToXebRsPZ8DI7l62GFuhu2AdglJlmORP8LlIMfJijrmjVuja2Iw7N7fxQ/exec'; 

const form = document.getElementById('formPegawai');
const loadingOverlay = document.getElementById('loadingOverlay');

let currentDataPegawai = [];
let currentDataPPh21 = [];
let dtPegawaiInstance = null;
let dtPPh21Instance = null;

const formatRupiah = (angka) => {
    if (!angka || isNaN(angka)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

// --- NAVIGASI SIDEBAR (SPA ROUTING) ---
function switchView(viewId, element) {
    // Sembunyikan semua view
    document.getElementById('viewDataPegawai').style.display = 'none';
    document.getElementById('viewPPh21').style.display = 'none';
    
    // Tampilkan view terpilih
    document.getElementById(viewId).style.display = 'block';
    
    // Update state menu aktif (UI)
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // Load data & set Header Title berdasarkan View
    if(viewId === 'viewDataPegawai') {
        document.getElementById('pageTitle').innerText = 'Modul Data Pegawai';
        loadData();
    } else if (viewId === 'viewPPh21') {
        document.getElementById('pageTitle').innerText = 'Kalkulasi PPh 21 Pegawai Tetap';
        loadDataPPh21();
    }
}

// --- FUNGSI MODUL: DATA PEGAWAI ---
async function loadData() {
    showLoading();
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        if (result.status === "success") {
            currentDataPegawai = result.data;
            renderTablePegawai();
        }
    } catch (error) { console.error('Error:', error); } 
    finally { hideLoading(); }
}

function renderTablePegawai() {
    if (dtPegawaiInstance) dtPegawaiInstance.destroy();
    const tbody = document.getElementById('tabelPegawai');
    tbody.innerHTML = '';

    currentDataPegawai.forEach((pegawai) => {
        const rowData = JSON.stringify(pegawai).replace(/"/g, '&quot;');
        tbody.innerHTML += `
            <tr>
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
                    <button class="btn btn-sm btn-warning action-btn text-white me-1" onclick='editData(${rowData})'><i class="fas fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger action-btn" onclick="hapusData(${pegawai.row})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    dtPegawaiInstance = $('#dataTablePegawai').DataTable(getDtConfig());
}

// --- FUNGSI MODUL: PPH 21 ---
async function loadDataPPh21() {
    showLoading();
    try {
        const response = await fetch(API_URL, {
            method: 'POST', body: JSON.stringify({ action: 'get_pph21' })
        });
        const result = await response.json();
        if (result.status === "success") {
            currentDataPPh21 = result.data;
            renderTablePPh21();
        }
    } catch (error) { console.error('Error:', error); } 
    finally { hideLoading(); }
}

function renderTablePPh21() {
    if (dtPPh21Instance) dtPPh21Instance.destroy();
    const tbody = document.getElementById('tabelPPh21');
    tbody.innerHTML = '';

    currentDataPPh21.forEach((data) => {
        tbody.innerHTML += `
            <tr>
                <td class="text-center">${data.no || ''}</td>
                <td class="fw-semibold text-dark">${data.nama || ''}</td>
                <td class="text-end">${formatRupiah(data.gaji_bruto)}</td>
                <td class="text-end fw-bold text-danger">${formatRupiah(data.pph21_bulanan)}</td>
            </tr>
        `;
    });

    dtPPh21Instance = $('#dataTablePPh21').DataTable(getDtConfig());
}

// --- KONFIGURASI UMUM DATATABLES ---
function getDtConfig() {
    return {
        language: { search: "", searchPlaceholder: "Cari data...", lengthMenu: "Tampilkan _MENU_ baris", info: "Menampilkan _START_ s/d _END_ dari _TOTAL_ data" },
        dom: '<"d-flex flex-wrap justify-content-between align-items-center mb-3"Bf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-3"ip>',
        buttons: [
            { extend: 'copy', className: 'btn btn-sm btn-outline-secondary', text: '<i class="fas fa-copy"></i> Copy' },
            { extend: 'csv', className: 'btn btn-sm btn-outline-info', text: '<i class="fas fa-file-csv"></i> CSV' },
            { extend: 'excel', className: 'btn btn-sm btn-outline-success', text: '<i class="fas fa-file-excel"></i> Excel' },
            { extend: 'pdf', className: 'btn btn-sm btn-outline-danger', text: '<i class="fas fa-file-pdf"></i> PDF' },
            { extend: 'print', className: 'btn btn-sm btn-outline-dark', text: '<i class="fas fa-print"></i> Print' }
        ],
        pageLength: 10, responsive: true
    };
}

// --- FUNGSI CRUD & KALKULASI PPH 21 (Dipertahankan dari versi sebelumnya) ---
form.addEventListener('submit', async function(e) {
    e.preventDefault(); showLoading();
    const record = {
        row: document.getElementById('rowId').value, no: document.getElementById('noUrut').value,
        nama: document.getElementById('nama').value, posisi: document.getElementById('posisi').value,
        status_pegawai: document.getElementById('status_pegawai').value, tk: document.getElementById('tk').value,
        gol: document.getElementById('gol').value, id_tku: document.getElementById('id_tku').value,
        unit: document.getElementById('unit').value, npwp: document.getElementById('npwp').value,
        kode_pajak: document.getElementById('kode_pajak').value, gaji: document.getElementById('gaji').value
    };
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: record.row ? 'update' : 'create', record: record }) });
        const result = await response.json();
        if (result.status === "success") { currentDataPegawai = result.data; renderTablePegawai(); resetForm(); }
    } catch (error) {} finally { hideLoading(); }
});

async function prosesHitungPPh21() {
    if (!confirm('Hitung PPh 21 untuk seluruh pegawai dan perbarui Sheet "PPH 21"?')) return;
    showLoading();
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'hitung_pph21' }) });
        const result = await response.json();
        if (result.status === "success") { alert('Kalkulasi Berhasil!'); loadData(); }
    } catch (error) {} finally { hideLoading(); }
}

function editData(p) {
    document.getElementById('rowId').value = p.row; document.getElementById('noUrut').value = p.no;
    document.getElementById('nama').value = p.nama; document.getElementById('posisi').value = p.posisi;
    document.getElementById('status_pegawai').value = p.status_pegawai; document.getElementById('tk').value = p.tk;
    document.getElementById('gol').value = p.gol; document.getElementById('id_tku').value = p.id_tku;
    document.getElementById('unit').value = p.unit; document.getElementById('npwp').value = p.npwp;
    document.getElementById('kode_pajak').value = p.kode_pajak; document.getElementById('gaji').value = p.gaji;
}

async function hapusData(row) {
    if(confirm('Hapus baris ini?')) {
        showLoading();
        try {
            const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', row: row }) });
            const result = await response.json();
            if (result.status === "success") { currentDataPegawai = result.data; renderTablePegawai(); }
        } catch (error) {} finally { hideLoading(); }
    }
}

function resetForm() { form.reset(); document.getElementById('rowId').value = ''; document.getElementById('noUrut').value = ''; }

// Initialize
document.addEventListener("DOMContentLoaded", loadData);