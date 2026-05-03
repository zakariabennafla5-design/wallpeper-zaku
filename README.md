# إعداد موقع خلفيات الكمبيوتر

## المتطلبات
- حساب Google
- مشروع Firebase

## خطوات الإعداد

1. **إنشاء مشروع Firebase:**
   - اذهب إلى [Firebase Console](https://console.firebase.google.com/)
   - أنشئ مشروع جديد
   - فعل Authentication و Storage

2. **الحصول على API Keys:**
   - في إعدادات المشروع، اذهب إلى "General" > "Your apps" > "Add app" (Web app)
   - انسخ الـ config object

3. **تحديث الكود:**
   - افتح `index.html`
   - ابحث عن `firebaseConfig` واستبدل القيم بالقيم من Firebase:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_PROJECT_ID.appspot.com",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```

4. **إعداد Storage Rules:**
   - في Firebase Console، اذهب إلى Storage > Rules
   - غير القواعد إلى:
     ```
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /wallpapers/{userId}/{allPaths=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```

5. **تشغيل الموقع:**
   - افتح `index.html` في المتصفح
   - اضغط "تسجيل الدخول بحساب Google"
   - أضف صورك وستُحفظ في حسابك

## الميزات
- تسجيل دخول Google
- حفظ الصور في السحابة
- عرض وتحميل الخلفيات
- ضغط الصور حسب الجودة المختارة

## ملاحظات
- الكود الآن مدمج في `index.html` لتجنب مشاكل التحميل
- تأكد من أن المتصفح يدعم ES modules (معظم المتصفحات الحديثة)