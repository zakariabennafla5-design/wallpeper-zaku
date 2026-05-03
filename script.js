const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('statusMessage');
const qualitySelect = document.getElementById('qualitySelect');
const clearLibraryBtn = document.getElementById('clearLibrary');

const DB_NAME = 'wallpaperLibraryDB';
const DB_STORE = 'images';
let db;
let images = [];

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = event => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(DB_STORE)) {
                database.createObjectStore(DB_STORE, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = event => {
            db = event.target.result;
            resolve(db);
        };
        request.onerror = () => reject(new Error('فشل فتح قاعدة البيانات'));
    });
}

function getAllImages() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readonly');
        const store = transaction.objectStore(DB_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('فشل قراءة الصور من قاعدة البيانات'));
    });
}

function addImageToDB(item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readwrite');
        const store = transaction.objectStore(DB_STORE);
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('فشل حفظ الصورة في قاعدة البيانات'));
    });
}

function deleteImageFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readwrite');
        const store = transaction.objectStore(DB_STORE);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('فشل حذف الصورة من قاعدة البيانات'));
    });
}

function clearDatabase() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readwrite');
        const store = transaction.objectStore(DB_STORE);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('فشل مسح المكتبة'));
    });
}

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? '#fb7185' : '#a5f3fc';
}

function fileToBlob(file, quality) {
    return new Promise((resolve, reject) => {
        if (quality >= 1) {
            return resolve(file);
        }

        const image = new Image();
        const reader = new FileReader();

        reader.onload = () => {
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(1920 / image.width, 1080 / image.height, 1);
                canvas.width = image.width * ratio;
                canvas.height = image.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('فشل ضغط الصورة'));
                }, 'image/jpeg', quality);
            };
            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function addImages(files) {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (!imageFiles.length) {
        setStatus('الملفات المضافة ليست صوراً. اختر صوراً فقط.', true);
        return;
    }

    const quality = Number(qualitySelect.value);
    let addedCount = 0;

    for (const file of imageFiles) {
        try {
            const blob = await fileToBlob(file, quality);
            await addImageToDB({ name: file.name, blob, createdAt: Date.now() });
            addedCount += 1;
        } catch (error) {
            console.error('خطأ في حفظ الصورة', error);
        }
    }

    loadSavedImages();
    setStatus(`${addedCount} صورة تمّت إضافتها إلى المكتبة.`);
}

function createImageUrl(blob) {
    return URL.createObjectURL(blob);
}

function revokeImageUrls() {
    images.forEach(item => {
        if (item.url) {
            URL.revokeObjectURL(item.url);
        }
    });
}

function updateGallery() {
    gallery.innerHTML = '';
    if (!images.length) {
        gallery.innerHTML = '<p style="color: var(--muted);">لا توجد خلفيات بعد. أضف صوراً لبدء المعرض.</p>';
        return;
    }

    images.forEach(item => {
        const card = document.createElement('article');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.name || `خلفية ${item.id}`;

        const body = document.createElement('div');
        body.className = 'card-body';

        const name = document.createElement('div');
        name.textContent = item.name || `صورة ${item.id}`;
        name.style.fontWeight = '600';
        name.style.color = '#e2e8f0';

        const buttons = document.createElement('div');
        buttons.className = 'buttons';

        const setBtn = document.createElement('button');
        setBtn.className = 'btn-set';
        setBtn.textContent = 'اجعلها خلفية';
        setBtn.addEventListener('click', () => setWallpaper(item.url, item.name));

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-download';
        downloadBtn.textContent = 'تحميل';
        downloadBtn.addEventListener('click', () => downloadImage(item));

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove';
        removeBtn.textContent = 'حذف';
        removeBtn.addEventListener('click', async () => {
            await removeImage(item.id);
        });

        buttons.appendChild(setBtn);
        buttons.appendChild(downloadBtn);
        buttons.appendChild(removeBtn);
        body.appendChild(name);
        body.appendChild(buttons);
        card.appendChild(img);
        card.appendChild(body);
        gallery.appendChild(card);
    });
}

function setWallpaper(imageUrl, name) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    setStatus(`تم عرض الخلفية: ${name}`);
}

function downloadImage(item) {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name || `wallpaper-${item.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function removeImage(id) {
    await deleteImageFromDB(id);
    setStatus('تم حذف الخلفية.');
    loadSavedImages();
}

fileInput.addEventListener('change', event => {
    addImages(event.target.files);
    fileInput.value = '';
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, event => event.preventDefault());
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'));
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'));
});

dropZone.addEventListener('drop', event => {
    if (event.dataTransfer.files.length) {
        addImages(event.dataTransfer.files);
    }
});

clearLibraryBtn.addEventListener('click', async () => {
    if (!confirm('هل تريد مسح كل الصور من المكتبة؟')) return;
    await clearDatabase();
    loadSavedImages();
    setStatus('تم مسح المكتبة بالكامل.');
});

async function loadSavedImages() {
    if (!db) return;
    revokeImageUrls();
    const saved = await getAllImages();
    images = saved.map(item => ({ ...item, url: createImageUrl(item.blob) }));
    updateGallery();
}

async function initialize() {
    await openDatabase();
    await loadSavedImages();
    setStatus('تم تحميل المكتبة. أضف صوراً أو افتح صندوق التحميل.');
}

initialize();
