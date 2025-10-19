var title = "ChatBot Conversation Tree";
var chat = [];

// Listen for messages from the main window
window.addEventListener('message', function(event) {
    if (event.data.type === 'CHAT_DATA') {
        title = event.data.title || "ChatBot Conversation Tree";
        chat = event.data.chat || [];
        buildTree();
    }
});

function buildTree() {
    let treeDiv = document.querySelector('.tree');
    treeDiv.innerHTML = '';

    // Title
    let titleLevel = document.createElement('div');
    titleLevel.className = 'level';
    let titleNode = document.createElement('div');
    titleNode.className = 'node title';
    titleNode.textContent = title;
    titleLevel.appendChild(titleNode);
    treeDiv.appendChild(titleLevel);
    
    if (chat.length > 0) {
        let arrow = document.createElement('div');
        arrow.className = 'arrow';
        treeDiv.appendChild(arrow);
    }

    // Build tree from chat array
    chat.forEach((msg, index) => {
        let data = msg.Message; // Access the Message object

        // Bot message
        let botLevel = document.createElement('div');
        botLevel.className = 'level';
        let botNode = document.createElement('div');
        botNode.className = 'node bot';
        botNode.textContent = data.bot;
        botLevel.appendChild(botNode);
        treeDiv.appendChild(botLevel);
        
        if (index < chat.length - 1) {
            let botArrow = document.createElement('div');
            botArrow.className = 'arrow';
            treeDiv.appendChild(botArrow);
        }

        // Choices
        let choiceLevel = document.createElement('div');
        choiceLevel.className = 'level';
        
        let userChoiceNode = document.createElement('div');
        userChoiceNode.className = 'node userChoice';
        userChoiceNode.textContent = data.userChoice;
        userChoiceNode.title = 'Selected choice';
        
        let otherChoiceNode = document.createElement('div');
        otherChoiceNode.className = 'node otherChoice';
        otherChoiceNode.textContent = data.otherChoice;
        otherChoiceNode.title = 'Alternative choice';
        
        choiceLevel.appendChild(userChoiceNode);
        choiceLevel.appendChild(otherChoiceNode);
        treeDiv.appendChild(choiceLevel);
        
        if (index < chat.length - 1) {
            let choiceArrow = document.createElement('div');
            choiceArrow.className = 'arrow';
            treeDiv.appendChild(choiceArrow);
        }
    });

    // End node only if there's chat data
    if (chat.length > 0) {
        let endLevel = document.createElement('div');
        endLevel.className = 'level';
        let endNode = document.createElement('div');
        endNode.className = 'node end';
        endNode.textContent = 'Conversation End';
        endLevel.appendChild(endNode);
        treeDiv.appendChild(endLevel);
    }
    
    // Add export button after tree is built
    createExportButton();
}

// Function to create and add the export button
function createExportButton() {
    // Remove existing button if it exists
    const existingBtn = document.getElementById('exportImageBtn');
    if (existingBtn) {
        existingBtn.remove();
    }

    // Create new export button
    const exportBtn = document.createElement('button');
    exportBtn.id = 'exportImageBtn';
    exportBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export Image';
    exportBtn.onclick = saveAsImage;
    
    // Add button to body
    document.body.appendChild(exportBtn);
}

// Function to save tree as image
function saveAsImage() {
    const element = document.getElementById("capture");
    const exportBtn = document.getElementById('exportImageBtn');
    
    if (!element) {
        showNotification('Error: Tree element not found', 'error');
        return;
    }
    
    // Show loading state
    if (exportBtn) {
        exportBtn.innerHTML = '<div class="loading" style="margin-right: 8px;"></div>Generating...';
        exportBtn.disabled = true;
    }

    // Temporarily hide the export button during capture
    if (exportBtn) {
        exportBtn.style.display = 'none';
    }

    html2canvas(element, {
        backgroundColor: '#0f0f23',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
    }).then(canvas => {
        // Convert canvas to image
        const image = canvas.toDataURL("image/png", 1.0);

        // Create a download link
        const link = document.createElement("a");
        link.href = image;
        
        // Create filename from title, removing special characters and spaces
        const cleanTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
        link.download = `chatbot-tree-${cleanTitle}-${new Date().toISOString().split('T')[0]}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success notification
        showNotification('Image exported successfully!', 'success');
        
        // Restore export button
        if (exportBtn) {
            exportBtn.style.display = 'block';
            exportBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export Image';
            exportBtn.disabled = false;
        }
    }).catch(error => {
        console.error('Error capturing image:', error);
        showNotification('Error generating image. Please try again.', 'error');
        
        // Restore export button
        if (exportBtn) {
            exportBtn.style.display = 'block';
            exportBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export Image';
            exportBtn.disabled = false;
        }
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        font-family: inherit;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'warning':
            notification.style.background = '#f59e0b';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        case 'success':
            notification.style.background = '#10b981';
            break;
        default:
            notification.style.background = '#6366f1';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Send ready message to parent window and show initial state
window.onload = function() {
    // Send ready message to parent window
    if (window.opener) {
        window.opener.postMessage({
            type: 'TREE_READY'
        }, '*');
    }
    
    // Show initial message if no chat data
    if (chat.length === 0) {
        let treeDiv = document.querySelector('.tree');
        treeDiv.innerHTML = `
            <div style="
                text-align: center; 
                padding: 3rem 1rem; 
                color: var(--text-secondary);
                font-size: 1.1rem;
                max-width: 400px;
                margin: 0 auto;
            ">
                <div style="margin-bottom: 1rem; font-size: 3rem;">🌳</div>
                <div style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Waiting for chat data...</div>
                <div>Start a conversation in the main chat to see your conversation tree here.</div>
            </div>
        `;
    } else {
        buildTree();
    }
}; 