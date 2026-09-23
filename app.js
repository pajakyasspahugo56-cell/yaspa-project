// ====== GANTI DENGAN URL WEB APP DEPLOYMENT TERBARU ======
const API_URL = 'https://script.google.com/macros/s/AKfycbzamdzE76MHfToXebRsPZ8DI7l62GFuhu2AdglJlmORP8LlIMfJijrmjVuja2Iw7N7fxQ/exec'; 

const form = document.getElementById('formPegawai');
const loadingOverlay = document.getElementById('loadingOverlay');

// Variabel State Data
let currentDataPegawai = [];
let currentDataPPh21 = [];
let currentDataPesangonTetap = [];
let currentDataPNS = [];
let currentDataKontrak = [];
let currentDataTidakTetap = []; // Data Tidak Tetap

// Variabel Instance DataTables
let dtPegawaiInstance = null;
let dtPPh21Instance = null;
let dtTetapInstance = null;
let dtPNSInstance = null;
let dtKontrakInstance = null;
let dtTidakTetapInstance = null; // Tabel Tidak Tetap

const formatRupiah = (angka) => {
    if (!angka || isNaN(angka)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

// --- NAVIGASI SIDEBAR (SPA ROUTING) ---
function switchView(viewId, element) {
    const views = ['viewDataPegawai', 'viewPPh21', 'viewPesangonTetap', 'viewPNS', 'viewKontrak', 'viewTidakTetap'];
    views.forEach(v => {
        let el = document.getElementById(v);
        if(el) el.style.display = 'none';
    });
    
    document.getElementById(viewId).style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    if(viewId === 'viewDataPegawai') {
        document.getElementById('pageTitle').innerText = 'Modul Data Pegawai';
        loadData();
    } else if (viewId === 'viewPPh21') {
        document.getElementById('pageTitle').innerText = 'PPh 21 - Pegawai Tetap (21-100-01)';
        loadDataPPh21();
    } else if (viewId === 'viewPesangonTetap') {
        document.getElementById('pageTitle').innerText = 'PPh 21 Final - Uang Pesangon (21-401-01)';
        loadDataKategori('get_pesangon_tetap', renderTablePesangonTetap);
    } else if (viewId === 'viewPNS') {
        document.getElementById('pageTitle').innerText = 'PPh 21 - Pegawai Negeri Sipil (PNS)';
        loadDataKategori('get_pns', renderTablePNS);
    } else if (viewId === 'viewKontrak') {
        document.getElementById('pageTitle').innerText = 'PPh 21 (21-100-18) - Honor / Belum Tetap';
        loadDataKategori('get_kontrak', renderTableKontrak);
    } else if (viewId === 'viewTidakTetap') {
        document.getElementById('pageTitle').innerText = 'PPh 21 Tidak Final (21-100-03) - Pegawai Tidak Tetap';
        loadDataKategori('get_tidak_tetap', renderTableTidakTetap);
    }
}

// ========================================================
// FUNGSI PENGAMBILAN DATA (FETCHING API) & RENDER TABEL
// ========================================================

// 1. DATA PEGAWAI UTAMA
async function loadData() {
    showLoading();
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        if (result.status === "success") { currentDataPegawai = result.data; renderTablePegawai(); }
    } catch (error) { console.error('Error:', error); } finally { hideLoading(); }
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
                <td><span class="badge bg-secondary">${pegawai.status_pegawai || ''}</span></td>
                <td class="text-center">${pegawai.tk || ''}</td>
                <td class="text-center">${pegawai.gol || ''}</td>
                <td class="text-center">${pegawai.id_tku || ''}</td>
                <td>${pegawai.unit || ''}</td>
                <td>${pegawai.npwp || ''}</td>
                <td class="text-end fw-semibold text-primary">${formatRupiah(pegawai.gaji)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning action-btn text-white me-1" onclick='editData(${rowData})'><i class="fas fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger action-btn" onclick="hapusData(${pegawai.row})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    dtPegawaiInstance = $('#dataTablePegawai').DataTable(getDtConfig());
}

// 2. DATA KATEGORI
async function loadDataKategori(actionName, renderFunction) {
    showLoading();
    try {
        const response = await fetch(API_URL, {
            method: 'POST', body: JSON.stringify({ action: actionName })
        });
        const result = await response.json();
        if (result.status === "success") {
            if (actionName === 'get_pesangon_tetap') { currentDataPesangonTetap = result.data; }
            else if (actionName === 'get_pns') { currentDataPNS = result.data; }
            else if (actionName === 'get_kontrak') { currentDataKontrak = result.data; }
            else if (actionName === 'get_tidak_tetap') { currentDataTidakTetap = result.data; }
            renderFunction();
        }
    } catch (error) { console.error('Error:', error); } 
    finally { hideLoading(); }
}

function renderTablePesangonTetap() {
    if (dtTetapInstance) dtTetapInstance.destroy();
    const tbody = document.getElementById('tabelPesangonTetap');
    if (!tbody) return; tbody.innerHTML = '';
    currentDataPesangonTetap.forEach((data) => {
        tbody.innerHTML += `
            <tr>
                <td class="text-center">${data.no || ''}</td>
                <td class="fw-semibold text-dark">${data.nama || ''}</td>
                <td>${data.npwp || '-'}</td>
                <td class="text-center"><span class="badge bg-primary">${data.kode_pajak || '21-401-01'}</span></td>
                <td class="text-end">${formatRupiah(data.gaji_bruto)}</td>
                <td class="text-end fw-bold text-success">${formatRupiah(data.pph21)}</td>
            </tr>`;
    });
    dtTetapInstance = $('#dataTablePesangonTetap').DataTable(getDtConfig());
}

function renderTablePNS() {
    if (dtPNSInstance) dtPNSInstance.destroy();
    const tbody = document.getElementById('tabelPNS');
    if (!tbody) return; tbody.innerHTML = '';
    currentDataPNS.forEach((data) => {
        tbody.innerHTML += `
            <tr>
                <td class="text-center">${data.no || ''}</td>
                <td class="fw-semibold text-dark">${data.nama || ''}</td>
                <td>${data.npwp || '-'}</td>
                <td class="text-center"><span class="badge bg-info">Golongan ${data.info_ekstra || '-'}</span></td>
                <td class="text-end">${formatRupiah(data.gaji_bruto)}</td>
                <td class="text-end fw-bold text-info">${formatRupiah(data.pph21)}</td>
            </tr>`;
    });
    dtPNSInstance = $('#dataTablePNS').DataTable(getDtConfig());
}

function renderTableKontrak() {
    if (dtKontrakInstance) dtKontrakInstance.destroy();
    const tbody = document.getElementById('tabelKontrak');
    if (!tbody) return; tbody.innerHTML = '';
    currentDataKontrak.forEach((data) => {
        tbody.innerHTML += `
            <tr>
                <td class="text-center">${data.no || ''}</td>
                <td class="fw-semibold text-dark">${data.nama || ''}</td>
                <td>${data.npwp || '-'}</td>
                <td class="text-center"><span class="badge bg-danger">${data.info_ekstra || ''}</span><br><small>21-100-18</small></td>
                <td class="text-end">${formatRupiah(data.gaji_bruto)}</td>
                <td class="text-end fw-bold text-danger">${formatRupiah(data.pph21)}</td>
            </tr>`;
    });
    dtKontrakInstance = $('#dataTableKontrak').DataTable(getDtConfig());
}

function renderTableTidakTetap() {
    if (dtTidakTetapInstance) dtTidakTetapInstance.destroy();
    const tbody = document.getElementById('tabelTidakTetap');
    if (!tbody) return; tbody.innerHTML = '';
    currentDataTidakTetap.forEach((data) => {
        tbody.innerHTML += `
            <tr>
                <td class="text-center">${data.no || ''}</td>
                <td class="fw-semibold text-dark">${data.nama || ''}</td>
                <td>${data.npwp || '-'}</td>
                <td class="text-center"><span class="badge bg-warning text-dark">${data.kode_pajak || '21-100-03'}</span></td>
                <td class="text-end">${formatRupiah(data.gaji_bruto)}</td>
                <td class="text-end fw-bold text-warning">${formatRupiah(data.pph21)}</td>
            </tr>`;
    });
    dtTidakTetapInstance = $('#dataTableTidakTetap').DataTable(getDtConfig());
}

// 3. FUNGSI HITUNG OTOMATIS API
async function prosesHitungPajakStatus() {
    if (!confirm('Pisahkan dan hitung otomatis berdasarkan Status?')) return;
    showLoading();
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'hitung_pajak_status' }) });
        const result = await response.json();
        if (result.status === "success") { 
            alert('Kalkulasi Berhasil!'); 
            loadData(); 
        }
    } catch (error) { console.error('Error:', error); } finally { hideLoading(); }
}

async function prosesHitungTidakTetap() {
    if (!confirm('Hitung PPh 21 (21-100-03) khusus untuk Pegawai Tidak Tetap?')) return;
    showLoading();
    try {
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: 'hitung_pph21_tidak_tetap' }) 
        });
        const result = await response.json();
        if (result.status === "success") { 
            alert('Perhitungan 21-100-03 Berhasil Disimpan!'); 
            currentDataTidakTetap = result.data; 
            renderTableTidakTetap(); 
        }
    } catch (error) { alert('Terjadi Kesalahan!'); console.error('Error:', error); } finally { hideLoading(); }
}

async function loadDataPPh21() {
    showLoading();
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'get_pph21_tetap' }) });
        const result = await response.json();
        if (result.status === "success") { currentDataPPh21 = result.data; renderTablePPh21(); }
    } catch (error) { console.error('Error:', error); } finally { hideLoading(); }
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
                <td class="text-end fw-bold text-primary">${formatRupiah(data.pph21_bulanan)}</td>
            </tr>`;
    });
    dtPPh21Instance = $('#dataTablePPh21').DataTable(getDtConfig());
}

async function prosesHitungPPh21() {
    if (!confirm('Hitung otomatis TER PPh 21 Pegawai Tetap?')) return;
    showLoading();
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'hitung_pph21_tetap' }) });
        const result = await response.json();
        if (result.status === "success") { alert('Perhitungan PPh 21 Berhasil Disimpan ke Sheet!'); }
    } catch (error) { alert('Terjadi Kesalahan!'); } finally { hideLoading(); }
}

// 4. KONFIGURASI DATATABLE DAN CRUD
function getDtConfig() {
    return {
        language: { search: "", searchPlaceholder: "Cari data...", lengthMenu: "Tampilkan _MENU_ baris", info: "Menampilkan _START_ s/d _END_ dari _TOTAL_ data" },
        dom: '<"d-flex flex-wrap justify-content-between align-items-center mb-3"Bf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-3"ip>',
        buttons: [
            { extend: 'copy', className: 'btn btn-sm btn-outline-secondary', text: '<i class="fas fa-copy"></i> Copy' },
            { extend: 'excel', className: 'btn btn-sm btn-outline-success', text: '<i class="fas fa-file-excel"></i> Excel' },
            { extend: 'pdf', className: 'btn btn-sm btn-outline-danger', text: '<i class="fas fa-file-pdf"></i> PDF' },
            { extend: 'print', className: 'btn btn-sm btn-outline-dark', text: '<i class="fas fa-print"></i> Print' }
        ],
        pageLength: 10, responsive: true, destroy: true
    };
}

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

// Pemanggilan Data Utama
function loadDataPesangonTetap() { loadDataKategori('get_pesangon_tetap', renderTablePesangonTetap); }
function loadDataPNS() { loadDataKategori('get_pns', renderTablePNS); }
function loadDataKontrak() { loadDataKategori('get_kontrak', renderTableKontrak); }
function loadDataTidakTetap() { loadDataKategori('get_tidak_tetap', renderTableTidakTetap); }

document.addEventListener("DOMContentLoaded", loadData);