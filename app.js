// ====== GANTI DENGAN URL WEB APP DEPLOYMENT TERBARU ======
const API_URL = 'https://script.google.com/macros/s/AKfycbzamdzE76MHfToXebRsPZ8DI7l62GFuhu2AdglJlmORP8LlIMfJijrmjVuja2Iw7N7fxQ/exec'; 

const form = document.getElementById('formPegawai');
const loadingOverlay = document.getElementById('loadingOverlay');

// Variabel State Data
let currentDataPegawai = [];
let currentDataPesangonTetap = [];
let currentDataPNS = [];
let currentDataKontrak = [];

// Variabel Instance DataTables
let dtPegawaiInstance = null;
let dtTetapInstance = null;
let dtPNSInstance = null;
let dtKontrakInstance = null;

const formatRupiah = (angka) => {
    if (!angka || isNaN(angka)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

// --- NAVIGASI SIDEBAR (SPA ROUTING) ---
function switchView(viewId, element) {
    // Sembunyikan semua view
    const views = ['viewDataPegawai', 'viewPesangonTetap', 'viewPNS', 'viewKontrak'];
    views.forEach(v => {
        let el = document.getElementById(v);
        if(el) el.style.display = 'none';
    });
    
    // Tampilkan view terpilih
    document.getElementById(viewId).style.display = 'block';
    
    // Update state menu aktif (UI)
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    // Load data & set Header Title berdasarkan View
    if(viewId === 'viewDataPegawai') {
        document.getElementById('pageTitle').innerText = 'Modul Data Pegawai';
        loadData();
    } else if (viewId === 'viewPesangonTetap') {
        document.getElementById('pageTitle').innerText = 'PPh 21 Final - Uang Pesangon (Pegawai Tetap)';
        loadDataKategori('get_pesangon_tetap', renderTablePesangonTetap);
    } else if (viewId === 'viewPNS') {
        document.getElementById('pageTitle').innerText = 'PPh 21 - Pegawai Negeri Sipil (PNS)';
        loadDataKategori('get_pns', renderTablePNS);
    } else if (viewId === 'viewKontrak') {
        document.getElementById('pageTitle').innerText = 'PPh 21 (21-100-18) - Pegawai Kontrak/Honor';
        loadDataKategori('get_kontrak', renderTableKontrak);
    }
}

// --- FUNGSI PENGAMBILAN DATA & RENDER BERDASARKAN KATEGORI ---
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
                <td class="text-center"><span class="badge bg-primary">21-401-01</span></td>
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
                <td class="text-center">Golongan ${data.info_ekstra || '-'}</td>
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
                <td class="text-center"><span class="badge bg-danger">${data.info_ekstra || ''}</span> <br><small>21-100-18</small></td>
                <td class="text-end">${formatRupiah(data.gaji_bruto)}</td>
                <td class="text-end fw-bold text-warning">${formatRupiah(data.pph21)}</td>
            </tr>`;
    });
    dtKontrakInstance = $('#dataTableKontrak').DataTable(getDtConfig());
}

// --- FUNGSI MASTER KALKULASI PAJAK SEMUA KATEGORI ---
async function prosesHitungPajakStatus() {
    if (!confirm('Sistem akan menyaring seluruh pegawai secara otomatis dan menghitung pajak (Pesangon Tetap, PNS, & Kontrak) sesuai golongannya. Lanjutkan?')) return;
    showLoading();
    try {
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: 'hitung_pajak_status' }) 
        });
        const result = await response.json();
        if (result.status === "success") { 
            alert(`Kalkulasi Berhasil!\n- Pegawai Tetap: ${result.data.tetap} orang\n- PNS: ${result.data.pns} orang\n- Honor/Kontrak: ${result.data.kontrak} orang`); 
            // Reload table yang sedang aktif
            const activeTitle = document.getElementById('pageTitle').innerText;
            if(activeTitle.includes('Tetap')) loadDataKategori('get_pesangon_tetap', renderTablePesangonTetap);
            else if(activeTitle.includes('PNS')) loadDataKategori('get_pns', renderTablePNS);
            else if(activeTitle.includes('Kontrak')) loadDataKategori('get_kontrak', renderTableKontrak);
        }
    } catch (error) { console.error('Error:', error); } 
    finally { hideLoading(); }
}

// --- KONFIGURASI UMUM DATATABLES ---
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

// --- FUNGSI MODUL: DATA PEGAWAI UTAMA ---
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

// Initialize
document.addEventListener("DOMContentLoaded", loadData);