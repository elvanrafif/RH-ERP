// pb_hooks/main.pb.js

// Fungsi Helper untuk mencatat log
function logActivity(e, action) {
    const authRecord = e.httpContext.get("authRecord"); // Ambil user aktif
    const collectionName = e.collection.name;
    
    // Ambil data record (sebelum/sesudah)
    const record = e.record;
    let description = `${action.toUpperCase()} on ${collectionName}`;
    
    // Kustomisasi deskripsi berdasarkan isi data
    if (collectionName === 'invoices') {
        description = `${action} invoice #${record.get("invoice_number")}`;
    } else if (collectionName === 'quotations') {
        description = `${action} quotation: ${record.get("title")}`; 
    } else if (collectionName === 'projects') {
        description = `${action} project: ${record.get("type")}`;
    }

    // Simpan ke tabel activity_logs
    const logCollection = $app.dao().findCollectionByNameOrId("activity_logs");
    const log = new Record(logCollection, {
        "user": authRecord ? authRecord.id : null,
        "action": action,
        "collection": collectionName,
        "record_id": record.id,
        "description": description
    });

    $app.dao().saveRecord(log);
}

// Daftarkan tabel yang ingin diawasi
const watchedCollections = ['invoices', 'quotations', 'projects'];

watchedCollections.forEach((name) => {
    // Jalankan log setelah data berhasil dibuat
    onRecordAfterCreateRequest((e) => {
        logActivity(e, 'create');
    }, name);

    // Jalankan log setelah data berhasil diubah
    onRecordAfterUpdateRequest((e) => {
        logActivity(e, 'update');
    }, name);

    // Jalankan log sebelum data dihapus (agar kita masih punya info ID-nya)
    onRecordBeforeDeleteRequest((e) => {
        logActivity(e, 'delete');
    }, name);
});