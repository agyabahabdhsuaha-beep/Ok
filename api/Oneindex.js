export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>MonLuaProtector</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { font-family: 'Inter', sans-serif; }
    
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    
    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .card-shadow {
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    
    .btn-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: all 0.3s ease;
      min-height: 48px;
      touch-action: manipulation;
    }
    
    .btn-gradient:active {
      transform: scale(0.98);
    }
    
    .btn-gradient:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
    
    .input-focus {
      transition: all 0.3s ease;
    }
    
    .input-focus:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    textarea.input-focus {
      resize: vertical;
      min-height: 180px;
    }
    
    .animate-in {
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>
<body class="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen m-0 p-0">
  <div class="w-full px-4 py-6 sm:py-12">
    <div class="max-w-2xl mx-auto">
      <div class="bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 card-shadow">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold flex items-center gap-2 mb-2">
              <i class="fas fa-tag text-purple-400"></i>Tên Script
            </label>
            <input 
              id="scriptName" 
              type="text" 
              placeholder="Đặt tên rawlink" 
              class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white input-focus text-sm"
            />
          </div>

          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <label class="block text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-code text-purple-400"></i>Script Luau
              </label>
              <label class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer transition">
                <i class="fas fa-file-upload"></i>
                <span class="hidden sm:inline">Upload</span>
                <input 
                  id="fileInput" 
                  type="file" 
                  accept=".lua,.txt" 
                  class="hidden"
                  onchange="handleFileUpload()"
                />
              </label>
            </div>
            <textarea 
              id="luaText" 
              rows="6"
              placeholder="Dán code Lua vào đây hoặc upload file..." 
              class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white input-focus text-sm resize-none"
            ></textarea>
            <p class="text-xs text-gray-400 mt-2">Tối đa 100MB (code)</p>
          </div>
          <button 
            id="textBtn" 
            class="w-full btn-gradient text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            onclick="handleTextUpload()"
          >
            <i class="fas fa-check-circle"></i>Tạo RawLink
          </button>
        </div>

        <div id="result" class="hidden mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700 animate-in">
          <div class="bg-gray-700 border border-gray-600 p-4 sm:p-6 rounded-lg">
            <div class="flex items-start gap-3 mb-4">
              <i class="fas fa-check-circle text-green-400 text-lg sm:text-xl mt-0.5"></i>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm sm:text-base mb-1">Tạo thành công!</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <p class="text-xs uppercase font-semibold text-gray-400 mb-2">Raw Link:</p>
                <div class="flex gap-2">
                  <input 
                    id="rawLink" 
                    type="text" 
                    readonly 
                    class="flex-1 min-w-0 px-3 py-2 sm:px-4 sm:py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs sm:text-sm font-mono cursor-pointer break-all"
                  />
                  <button 
                    id="copyBtn" 
                    class="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center gap-1 sm:gap-2 text-sm flex-shrink-0 min-h-10"
                  >
                    <i class="fas fa-copy"></i><span class="hidden sm:inline">Copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg">
              <p class="text-xs text-green-300">
                <i class="fas fa-lock mr-2"></i>
                <span>Hãy dùng obfuscate để chắc chắn hơn</span>
              </p>
            </div>
          </div>
        </div>

        <div id="loading" class="hidden mt-6 sm:mt-8 text-center">
          <div class="inline-block">
            <i class="fas fa-spinner fa-spin text-2xl sm:text-3xl text-blue-400"></i>
            <p class="mt-2 text-gray-400 text-sm">Đang xử lý...</p>
          </div>
        </div>

        <div id="error" class="hidden mt-6 sm:mt-8 p-3 sm:p-4 bg-red-900 border border-red-700 rounded-lg animate-in">
          <p class="flex items-start gap-2 text-red-200 text-sm">
            <i class="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
            <span id="errorMsg" class="break-words"></span>
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 sm:mt-8 mb-6 sm:mb-8">
        <div class="bg-gray-800 border border-gray-700 p-3 sm:p-4 rounded-lg card-shadow">
          <i class="fas fa-shield-alt text-xl sm:text-2xl text-blue-400 mb-2 block"></i>
          <h3 class="font-bold text-sm sm:text-base mb-1">Bảo mật</h3>
          <p class="text-xs sm:text-sm text-gray-400">Hãy dùng obfuscate để chắc chắn hơn</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 p-3 sm:p-4 rounded-lg card-shadow">
          <i class="fas fa-cloud text-xl sm:text-2xl text-green-400 mb-2 block"></i>
          <h3 class="font-bold text-sm sm:text-base mb-1">Lưu trữ</h3>
          <p class="text-xs sm:text-sm text-gray-400">Ngon lành</p>
        </div>
        <div class="bg-gray-800 border border-gray-700 p-3 sm:p-4 rounded-lg card-shadow">
          <i class="fas fa-zap text-xl sm:text-2xl text-yellow-400 mb-2 block"></i>
          <h3 class="font-bold text-sm sm:text-base mb-1">Nhanh</h3>
          <p class="text-xs sm:text-sm text-gray-400">Tạo link ngay lập tức</p>
        </div>
      </div>

      <div class="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm pb-4">
        <p>v2.1 | Bảo vệ Script Lua</p>
      </div>
    </div>
  </div>

  <script>
    function showLoading(show) {
      document.getElementById('loading').classList.toggle('hidden', !show);
      document.getElementById('result').classList.add('hidden');
      document.getElementById('error').classList.add('hidden');
    }

    function showError(msg) {
      document.getElementById('errorMsg').textContent = msg;
      document.getElementById('error').classList.remove('hidden');
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('result').classList.add('hidden');
    }

    function showResult(rawLink) {
      document.getElementById('rawLink').value = rawLink;
      document.getElementById('result').classList.remove('hidden');
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('error').classList.add('hidden');
    }

    async function sendData(text, name) {
      try {
        const res = await fetch('/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, name })
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Lỗi khi tạo link');
        }
        
        return await res.json();
      } catch (err) {
        throw new Error(err.message);
      }
    }

    async function handleFileUpload() {
      const file = document.getElementById('fileInput').files[0];
      const name = document.getElementById('scriptName').value.trim();

      if (!file) {
        showError('Vui lòng chọn file');
        return;
      }

      if (!name) {
        showError('Vui lòng nhập tên script');
        return;
      }

      if (!/^[a-zA-Z0-9\-]+$/.test(name)) {
        showError('Tên script chỉ được chứa chữ cái, số, và dấu gạch ngang (-)');
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        showError('File quá lớn (tối đa 100MB)');
        return;
      }

      showLoading(true);
      try {
        const text = await file.text();
        const data = await sendData(text, name);
        showResult(data.raw);
      } catch (err) {
        showError(err.message);
      }
    }

    async function handleTextUpload() {
      const text = document.getElementById('luaText').value.trim();
      const name = document.getElementById('scriptName').value.trim();

      if (!text) {
        showError('Vui lòng nhập code');
        return;
      }

      if (!name) {
        showError('Vui lòng nhập tên script');
        return;
      }

      if (!/^[a-zA-Z0-9\-]+$/.test(name)) {
        showError('Tên script chỉ được chứa chữ cái, số, và dấu gạch ngang (-)');
        return;
      }

      if (text.length > 100 * 1024 * 1024) {
        showError('Code quá dài (tối đa 100MB)');
        return;
      }

      showLoading(true);
      try {
        const data = await sendData(text, name);
        showResult(data.raw);
      } catch (err) {
        showError(err.message);
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('copyBtn').addEventListener('click', () => {
        const link = document.getElementById('rawLink').value;
        navigator.clipboard.writeText(link).then(() => {
          const btn = document.getElementById('copyBtn');
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i>';
          btn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
          }, 2000);
        });
      });
    });
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.status(200).send(html);
}

