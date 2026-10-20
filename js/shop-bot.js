/**
 * ShopSphere AI Assistant - Shared Widget Loader
 * Injects the floating AI chat interface with an attention-grabbing popout cloud.
 */
(function() {
    // 1. Inject Style Rules into Document Head
    const style = document.createElement('style');
    style.textContent = `
        #ai-chat-widget {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 5000;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
        }

        /* --- ATTENTION GRABBING POPOUT CLOUD --- */
        #chat-popout-cloud {
            position: absolute;
            right: 75px;
            background: #22c55e;
            color: #000;
            font-weight: 700;
            font-size: 12px;
            padding: 10px 16px;
            border-radius: 16px;
            white-space: nowrap;
            box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
            opacity: 0;
            transform: translateX(15px);
            pointer-events: none;
            transition: opacity 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                        transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Cloud Arrow Pointer */
        #chat-popout-cloud::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 6px 0 6px 6px;
            border-style: solid;
            border-color: transparent transparent transparent #22c55e;
        }

        #chat-popout-cloud.show {
            opacity: 1;
            transform: translateX(0);
            animation: gentleFloat 3s ease-in-out infinite alternate;
        }

        @keyframes gentleFloat {
            0% { transform: translateY(0); }
            100% { transform: translateY(-5px); }
        }

        /* --- FLOATING TRIGGER BUTTON --- */
        #chat-trigger-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #22c55e;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: transform 0.2s ease, background 0.2s;
        }
        #chat-trigger-btn:hover {
            transform: scale(1.08);
            background: #16a34a;
        }
        #chat-trigger-btn .bot-icon { font-size: 26px; }
        #chat-trigger-btn .notification-dot {
            position: absolute; top: 2px; right: 2px;
            width: 12px; height: 12px; background: #ef4444;
            border-radius: 50%; border: 2px solid #030712;
        }

        /* --- EXPANDED PANEL LAYOUT --- */
        #chat-window-panel {
            position: absolute;
            bottom: 75px;
            right: 0;
            width: 340px;
            height: 460px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        #chat-window-panel.open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }
        .chat-header {
            background: rgba(3, 7, 18, 0.6);
            padding: 14px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .header-info { display: flex; align-items: center; gap: 10px; }
        .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
        .header-info h4 { margin: 0; font-size: 14px; font-weight: 800; color: #fff; line-height: 1.2; }
        .header-info p { margin: 0; font-size: 11px; color: #9ca3af; }
        .close-chat-btn { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px; }
        .close-chat-btn:hover { color: #fff; }
        #chat-messages-box {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        #chat-messages-box::-webkit-scrollbar { width: 4px; }
        #chat-messages-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .chat-msg-bubble {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 16px;
            font-size: 13px;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .bot-bubble {
            background: rgba(255, 255, 255, 0.06);
            color: #f9fafb;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        .user-bubble {
            background: #22c55e;
            color: #000;
            font-weight: 600;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }
        .system-bubble {
            font-size: 11px; color: #6b7280; text-align: center; align-self: center; font-style: italic;
        }
        .chat-input-area {
            padding: 12px;
            background: rgba(3, 7, 18, 0.4);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            gap: 8px;
        }
        #chat-user-input {
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            outline: none;
        }
        #chat-user-input:focus { border-color: #22c55e; }
        #chat-send-btn {
            background: #22c55e;
            border: none; width: 36px; height: 36px;
            border-radius: 10px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s;
        }
        #chat-send-btn:hover { background: #16a34a; }
        #chat-send-btn svg { width: 16px; height: 16px; fill: #000; }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML Widget Nodes into Body Frame
    const widget = document.createElement('div');
    widget.id = 'ai-chat-widget';
    widget.innerHTML = `
        <div id="chat-popout-cloud">Ask anything about ShopSphere! ✨</div>
        <button id="chat-trigger-btn">
            <span class="bot-icon">🤖</span>
            <span class="notification-dot"></span>
        </button>
        <div id="chat-window-panel">
            <div class="chat-header">
                <div class="header-info">
                    <span class="status-dot"></span>
                    <div>
                        <h4>SphereBot</h4>
                        <p>ShopSphere AI Assistant</p>
                    </div>
                </div>
                <button class="close-chat-btn">✕</button>
            </div>
            <div id="chat-messages-box">
                <div class="chat-msg-bubble bot-bubble">
                    👋 Hi there! I'm SphereBot. Ask me anything about our products, stock levels, or delivery rates!
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-user-input" placeholder="Ask about items or delivery...">
                <button id="chat-send-btn">
                    <svg viewBox="0 0 24 24"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // 3. Functional Logic Layout Configurations
    const CHAT_API_ENDPOINT = "https://shopsphere-backend-wr5o.onrender.com/ai-chat";
    const panel = document.getElementById("chat-window-panel");
    const trigger = document.getElementById("chat-trigger-btn");
    const popoutCloud = document.getElementById("chat-popout-cloud");
    const closeBtn = widget.querySelector(".close-chat-btn");
    const sendBtn = document.getElementById("chat-send-btn");
    const userInput = document.getElementById("chat-user-input");
    const msgBox = document.getElementById("chat-messages-box");

    // Clear attention getters permanently once interactive engagement begins
    function hideAttentionGetters() {
        if (popoutCloud) popoutCloud.remove(); 
        const dot = trigger.querySelector(".notification-dot");
        if (dot) dot.style.display = "none";
    }

    // Global Window Function to let normal page buttons open up the bot panel frame
    window.openShopSphereChat = function() {
        panel.classList.add("open");
        hideAttentionGetters();
        setTimeout(() => userInput.focus(), 100);
    };

    function toggleChatWindow(e) {
        e.stopPropagation();
        panel.classList.toggle("open");
        hideAttentionGetters();
        if (panel.classList.contains("open")) {
            setTimeout(() => userInput.focus(), 100);
        }
    }

    // Delay popout cloud appearance by 3 seconds for smooth delivery entry feel
    setTimeout(() => {
        if (popoutCloud && !panel.classList.contains("open")) {
            popoutCloud.classList.add("show");
        }
    }, 3000);

    trigger.addEventListener("click", toggleChatWindow);
    closeBtn.addEventListener("click", toggleChatWindow);
    sendBtn.addEventListener("click", sendChatMessage);
    userInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChatMessage(); });

    async function sendChatMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        appendChatBubble(text, "user-bubble");
        userInput.value = "";
        
        const loaderId = "loader-" + Date.now();
        appendChatBubble("Thinking...", "bot-bubble system-bubble", loaderId);
        msgBox.scrollTop = msgBox.scrollHeight;

        try {
            const response = await fetch(CHAT_API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            document.getElementById(loaderId).remove();

            if (!response.ok) throw new Error(data.error || "Server connection fault");
            appendChatBubble(data.reply, "bot-bubble");

        } catch (err) {
            console.error("Chat engine fault:", err);
            const loaderNode = document.getElementById(loaderId);
            if (loaderNode) loaderNode.remove();
            appendChatBubble("❌ Connection issue. Please try again.", "bot-bubble system-bubble");
        }

        msgBox.scrollTop = msgBox.scrollHeight;
    }

    function appendChatBubble(text, className, fallbackId = null) {
        const bubble = document.createElement("div");
        bubble.className = `chat-msg-bubble ${className}`;
        if (fallbackId) bubble.id = fallbackId;
        bubble.innerText = text;
        msgBox.appendChild(bubble);
    }
})();
