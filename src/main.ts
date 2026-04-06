// UI Interaction Logic for ClawBot V2
document.addEventListener("DOMContentLoaded", () => {
  setupDualEngineVisualization();
  setupFormHandler();
  setupSmoothScroll();
  setupThemeToggle();
});

function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;
  
  const sunIcon = toggleBtn.querySelector('.sun-icon') as HTMLElement;
  const moonIcon = toggleBtn.querySelector('.moon-icon') as HTMLElement;
  
  // Check local storage
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
  
  toggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(el => {
    const anchor = el as HTMLAnchorElement;
    anchor.addEventListener('click', function (e: Event) {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerOffset = 70; // Chiều cao của Navbar = 70px
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          let startTime: number | null = null;
          const duration = 800; // ms

          function animation(currentTime: number) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            
            // Easing function (easeOutExpo)
            const progress = timeElapsed / duration;
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const run = startPosition + distance * easeProgress;
            
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
            else window.scrollTo(0, targetPosition);
          }

          requestAnimationFrame(animation);
        }
      }
    });
  });
}

function setupDualEngineVisualization() {
  const terminalView = document.getElementById("terminal-view");
  const chatView = document.getElementById("chat-view");
  const typingIndicator = document.getElementById("typing-indicator");

  if (!terminalView || !chatView || !typingIndicator) return;

  const demoScript = [
    { type: 'chat-in', text: 'Trích xuất báo cáo doanh số tháng 5 cho nhóm nhé.', delay: 1000 },
    { type: 'term', text: '> clawbot receive --channel=zalo', delay: 800 },
    { type: 'term', text: '> [!] Bắt đầu sandbox môi trường phân tích...', delay: 500, highlight: true },
    { type: 'term', text: '> [✓] Scraping https://sales.internal/...', delay: 1200 },
    { type: 'term', text: '> [✓] Phân tích hoàn tất. Tạo PDF.', delay: 1000 },
    { type: 'chat-out', text: 'Đã xong! Doanh số tháng 5 tăng 12%. File báo cáo chi tiết đính kèm bên dưới 📄', delay: 800 },
    { type: 'term', text: '> Tác vụ hoàn thành. Chờ lệnh...', delay: 3000 }, // Wait before looping
  ];

  let currentStep = 0;

  function runScript() {
    if (currentStep >= demoScript.length) {
      // Loop reset
      currentStep = 0;
      terminalView!.innerHTML = '<span class="sys-msg">Agent standby...</span><br>';
      // remove old bot messages
      const msgs = chatView?.querySelectorAll('.chat-message');
      msgs?.forEach(msg => {
         if(msg.id !== 'typing-indicator') msg.remove();
      });
      setTimeout(runScript, 1000);
      return;
    }

    const step = demoScript[currentStep];
    
    // Preparation/Pre-delay actions
    if (step.type === 'chat-out') {
      typingIndicator?.classList.remove('hidden');
      chatView!.scrollTop = chatView!.scrollHeight;
    }

    setTimeout(() => {
      // Execute Action
      if (step.type === 'chat-in') {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message user-msg';
        msgDiv.innerHTML = `<div class="msg-bubble">${step.text}</div>`;
        chatView!.insertBefore(msgDiv, typingIndicator);
        chatView!.scrollTop = chatView!.scrollHeight;
      } 
      else if (step.type === 'chat-out') {
        typingIndicator?.classList.add('hidden');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message bot-msg';
        msgDiv.innerHTML = `<div class="msg-bubble">${step.text}</div>`;
        chatView!.insertBefore(msgDiv, typingIndicator);
        chatView!.scrollTop = chatView!.scrollHeight;
      }
      else if (step.type === 'term') {
        const span = document.createElement('span');
        if (step.highlight) {
           span.className = 'cmd-line text-cyan';
        } else if (step.text.includes('>')) {
           span.innerHTML = `<span class="prompt">$</span> ${step.text.replace('>', '')}`;
           span.className = 'cmd-line';
        } else {
           span.className = 'sys-msg';
           span.textContent = step.text;
        }
        terminalView!.appendChild(span);
        terminalView!.appendChild(document.createElement('br'));
        terminalView!.scrollTop = terminalView!.scrollHeight;
      }

      currentStep++;
      runScript(); // trigger next step
    }, step.delay);
  }

  // Initial start
  terminalView!.innerHTML = '<span class="sys-msg">Khởi tạo ANFClaw Node...</span><br>';
  setTimeout(runScript, 1500);
}

function setupFormHandler() {
  const contactForm = document.getElementById("contact-form") as HTMLFormElement;
  const formMsg = document.getElementById("form-message");

  if (!contactForm || !formMsg) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const btn = contactForm.querySelector("button");
    if (btn) {
      btn.textContent = "ĐANG GỬI DỮ LIỆU...";
      btn.disabled = true;
    }

    const nameNode = document.getElementById("lead-name") as HTMLInputElement;
    const orgNode = document.getElementById("lead-org") as HTMLInputElement;
    const planNode = document.getElementById("lead-plan") as HTMLSelectElement;

    const name = nameNode?.value.trim() || "Chưa có";
    const org = orgNode?.value.trim() || "Chưa có";
    const plan = planNode?.value || "Chưa có";

    // WebApp URL của Google Apps Script để nhận Data
    const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbxlZiybOEWyOchDw9ij96Q3TSe2DYeOxq5meRMffqJPXGodsOxMlqmTMtlRzJ6VEwFJzw/exec"; 

    try {
      const urlParams = new URLSearchParams();
      urlParams.append("name", name);
      urlParams.append("org", org);
      urlParams.append("plan", plan);

      // Gọi lệnh lưu data xuống File Google Sheet
      await fetch(GOOGLE_SHEET_API, {
        method: 'POST',
        mode: 'no-cors',
        body: urlParams
      });

      formMsg.innerHTML = `Hệ thống đã ghi nhận yêu cầu.<br>Cảm ơn <b>${name}</b>, Kỹ sư ANFClaw sẽ tiếp nhận yêu cầu từ <b>${org}</b>!`;
      formMsg.classList.remove("hidden");
      formMsg.style.marginTop = "1rem";
      formMsg.style.color = "#00E5FF";
      contactForm.reset();
      
    } catch (err) {
      formMsg.textContent = "Có lỗi kết nối mạng. Vui lòng thử lại sau.";
      formMsg.classList.remove("hidden");
      formMsg.style.color = "#ff5f56";
    } finally {
      if (btn) {
        btn.textContent = "NHẬN TƯ VẤN KIẾN TRÚC HỆ THỐNG";
        btn.disabled = false;
      }
    }
  });
}
