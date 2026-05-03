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

3. **إعداد Authentication:**
   - في Firebase Console، اذهب إلى Authentication > Sign-in method
   - فعل "Google" كطريقة تسجيل دخول
   - فعل "Email/Password" كطريقة تسجيل دخول
   - في Settings > Authorized domains، أضف domain الموقع (مثل localhost أو domain الخاص بك)
   - إذا كان مشروع جديد، قد تحتاج إلى إعداد OAuth consent screen في Google Cloud Console

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
   - افتح Developer Tools (F12) واذهب إلى Console لرؤية رسائل الـ debugging
   - اضغط "تسجيل الدخول بحساب Google" - سيتم توجيهك إلى صفحة Google
   - بعد تسجيل الدخول، ستعود إلى الموقع تلقائياً
   - أضف صورك وستُحفظ في حسابك

## كيفية الاستخدام

1. افتح `index.html` في المتصفح
2. اضغط على "تسجيل الدخول بحساب Google" للدخول بحساب Google، أو "تسجيل الدخول بالبريد الإلكتروني" لإنشاء حساب جديد أو الدخول بحساب موجود
3. بعد تسجيل الدخول، يمكنك رفع الصور وضبط جودتها
4. اختر خلفية من المعرض لعرضها كخلفية للصفحة أو تحميلها

## استكشاف الأخطاء
- إذا ظهر "Firebase config غير محدث"، تأكد من تحديث `firebaseConfig`
- إذا لم يتم التوجيه إلى Google، تحقق من Console للأخطاء
- تأكد من أن المتصفح يسمح بالتوجيهات
- افتح Console في Developer Tools لرؤية رسائل الخطأ التفصيلية

## الميزات
- تسجيل دخول Google
- حفظ الصور في السحابة
- عرض وتحميل الخلفيات
- ضغط الصور حسب الجودة المختارة

## ملاحظات
- الكود الآن مدمج في `index.html` لتجنب مشاكل التحميل
- يستخدم `signInWithRedirect` بدلاً من popup لتجنب مشاكل الحظر
- تأكد من أن المتصفح يدعم ES modules (معظم المتصفحات الحديثة)