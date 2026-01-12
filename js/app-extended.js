const APP_EXTENDED = {
    savingsGoals: [],
    achievements: [],
    notifications: [],
    devices: [],
    themes: [],
    businessAccounts: [],
    offlineQueue: [],
    currentTheme: 'dark',
    userLevel: 1,
    userXP: 0,
    
    CATEGORIES: {
        'food': { name: 'Alimentação', icon: '🍕', color: '#FF6B6B' },
        'transport': { name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
        'shopping': { name: 'Compras', icon: '🛒', color: '#95E1D3' },
        'entertainment': { name: 'Lazer', icon: '🎬', color: '#F38181' },
        'bills': { name: 'Contas', icon: '📄', color: '#AA96DA' },
        'health': { name: 'Saúde', icon: '💊', color: '#FCBAD3' },
        'education': { name: 'Educação', icon: '📚', color: '#A8D8EA' },
        'other': { name: 'Outros', icon: '💰', color: '#B0B0B0' }
    },

    ACHIEVEMENTS: [
        { id: 'first_pix', name: 'Primeiro PIX', desc: 'Enviou seu primeiro PIX', icon: '⚡', xp: 50 },
        { id: 'first_investment', name: 'Investidor Iniciante', desc: 'Criou seu primeiro investimento', icon: '📈', xp: 100 },
        { id: 'save_1000', name: 'Economista', desc: 'Economizou R$ 1.000', icon: '💎', xp: 200 },
        { id: 'month_active', name: 'Usuário Ativo', desc: 'Usou o app por 30 dias', icon: '🔥', xp: 150 },
        { id: 'goal_reached', name: 'Meta Alcançada', desc: 'Completou uma meta financeira', icon: '🎯', xp: 250 },
        { id: 'level_10', name: 'Veterano', desc: 'Alcançou nível 10', icon: '👑', xp: 500 }
    ],

    THEMES: {
        'dark': {
            name: 'Dark Mode',
            primary: '#8A05BE',
            secondary: '#03DAC6',
            bgDark: '#0f3460',
            bgDarker: '#16213e',
            textLight: '#FFFFFF'
        },
        'amoled': {
            name: 'AMOLED',
            primary: '#BB86FC',
            secondary: '#03DAC6',
            bgDark: '#000000',
            bgDarker: '#000000',
            textLight: '#FFFFFF'
        },
        'neon': {
            name: 'Roxo Neon',
            primary: '#B24BF3',
            secondary: '#00F5FF',
            bgDark: '#1a0033',
            bgDarker: '#0d001a',
            textLight: '#E0E0E0'
        },
        'future': {
            name: 'Verde Futurista',
            primary: '#00FFA3',
            secondary: '#00D9FF',
            bgDark: '#001a0f',
            bgDarker: '#000d08',
            textLight: '#F0F0F0'
        }
    },

    AVATAR_MOODS: {
        'happy': '😊',
        'sad': '😔',
        'celebrate': '🎉',
        'thinking': '🤔',
        'money': '🤑',
        'surprised': '😲'
    },

    init() {
        this.loadExtendedData();
        this.checkAchievements();
        this.updateUserLevel();
        this.applyTheme(this.currentTheme);
        this.startNotificationSystem();
        this.updateAvatarMood();
    },

    loadExtendedData() {
        this.savingsGoals = JSON.parse(localStorage.getItem('neobank_savings_goals') || '[]');
        this.achievements = JSON.parse(localStorage.getItem('neobank_achievements') || '[]');
        this.notifications = JSON.parse(localStorage.getItem('neobank_notifications') || '[]');
        this.devices = JSON.parse(localStorage.getItem('neobank_devices') || '[]');
        this.businessAccounts = JSON.parse(localStorage.getItem('neobank_business') || '[]');
        this.offlineQueue = JSON.parse(localStorage.getItem('neobank_offline_queue') || '[]');
        this.currentTheme = localStorage.getItem('neobank_theme') || 'dark';
        this.userLevel = parseInt(localStorage.getItem('neobank_user_level') || '1');
        this.userXP = parseInt(localStorage.getItem('neobank_user_xp') || '0');
        
        if (this.devices.length === 0) {
            this.addDevice();
        }
    },

    saveExtendedData() {
        localStorage.setItem('neobank_savings_goals', JSON.stringify(this.savingsGoals));
        localStorage.setItem('neobank_achievements', JSON.stringify(this.achievements));
        localStorage.setItem('neobank_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('neobank_devices', JSON.stringify(this.devices));
        localStorage.setItem('neobank_business', JSON.stringify(this.businessAccounts));
        localStorage.setItem('neobank_offline_queue', JSON.stringify(this.offlineQueue));
        localStorage.setItem('neobank_theme', this.currentTheme);
        localStorage.setItem('neobank_user_level', this.userLevel.toString());
        localStorage.setItem('neobank_user_xp', this.userXP.toString());
    },

    analyzeFinancialProfile() {
        if (!APP.currentUser) return null;
        
        const transactions = APP.transactions.filter(t => t.userId === APP.currentUser.id);
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const recentTransactions = transactions.filter(t => new Date(t.date).getTime() > thirtyDaysAgo);
        
        const expenses = recentTransactions.filter(t => t.amount < 0);
        const income = recentTransactions.filter(t => t.amount > 0);
        
        const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        
        const categoriesSpending = {};
        expenses.forEach(t => {
            const category = this.categorizeTransaction(t);
            categoriesSpending[category] = (categoriesSpending[category] || 0) + Math.abs(t.amount);
        });
        
        const topCategory = Object.keys(categoriesSpending).reduce((a, b) => 
            categoriesSpending[a] > categoriesSpending[b] ? a : b, 'other'
        );
        
        const avgDailyExpense = totalExpenses / 30;
        const projectedBalance = APP.currentUser.balance + (totalIncome - totalExpenses);
        
        const suggestions = [];
        if (categoriesSpending['food'] > totalExpenses * 0.3) {
            suggestions.push('Seus gastos com alimentação estão altos. Considere cozinhar mais em casa.');
        }
        if (totalExpenses > totalIncome) {
            suggestions.push('Suas despesas estão maiores que sua renda. Revise seus gastos.');
        }
        if (avgDailyExpense > 100) {
            suggestions.push('Tente reduzir seus gastos diários para menos de R$ 100.');
        }
        
        return {
            totalExpenses,
            totalIncome,
            categoriesSpending,
            topCategory,
            avgDailyExpense,
            projectedBalance,
            suggestions,
            savingsRate: ((totalIncome - totalExpenses) / totalIncome * 100) || 0
        };
    },

    categorizeTransaction(transaction) {
        const desc = transaction.description.toLowerCase();
        
        if (desc.includes('comida') || desc.includes('restaurante') || desc.includes('mercado')) return 'food';
        if (desc.includes('uber') || desc.includes('transporte') || desc.includes('gasolina')) return 'transport';
        if (desc.includes('shopping') || desc.includes('loja') || desc.includes('compra')) return 'shopping';
        if (desc.includes('cinema') || desc.includes('lazer') || desc.includes('netflix')) return 'entertainment';
        if (desc.includes('conta') || desc.includes('boleto') || desc.includes('água')) return 'bills';
        if (desc.includes('farmácia') || desc.includes('médico') || desc.includes('hospital')) return 'health';
        if (desc.includes('curso') || desc.includes('livro') || desc.includes('escola')) return 'education';
        
        return 'other';
    },

    createSavingsGoal(name, description, targetAmount, emoji = '🎯') {
        const goal = {
            id: 'goal_' + Date.now(),
            userId: APP.currentUser.id,
            name,
            description,
            targetAmount,
            currentAmount: 0,
            emoji,
            autoDeposit: 0,
            frequency: 'none',
            createdAt: new Date().toISOString()
        };
        
        this.savingsGoals.push(goal);
        this.saveExtendedData();
        this.showNotification('Meta criada!', `Sua meta "${name}" foi criada com sucesso.`, 'success');
        return goal;
    },

    depositToGoal(goalId, amount) {
        const goal = this.savingsGoals.find(g => g.id === goalId);
        if (!goal) return;
        
        if (amount > APP.currentUser.balance) {
            alert('Saldo insuficiente!');
            return;
        }
        
        APP.currentUser.balance -= amount;
        APP.updateUser();
        
        goal.currentAmount += amount;
        
        APP.transactions.push({
            id: 'txn_' + Date.now(),
            userId: APP.currentUser.id,
            type: 'savings_deposit',
            amount: -amount,
            description: `Depósito em meta: ${goal.name}`,
            date: new Date().toISOString(),
            category: 'other'
        });
        
        APP.saveData();
        this.saveExtendedData();
        
        if (goal.currentAmount >= goal.targetAmount) {
            this.showNotification('Meta alcançada!', `Parabéns! Você alcançou a meta "${goal.name}"!`, 'success');
            this.unlockAchievement('goal_reached');
        }
        
        APP.render();
    },

    withdrawFromGoal(goalId) {
        const goal = this.savingsGoals.find(g => g.id === goalId);
        if (!goal || goal.currentAmount === 0) return;
        
        APP.currentUser.balance += goal.currentAmount;
        APP.updateUser();
        
        APP.transactions.push({
            id: 'txn_' + Date.now(),
            userId: APP.currentUser.id,
            type: 'savings_withdrawal',
            amount: goal.currentAmount,
            description: `Resgate de meta: ${goal.name}`,
            date: new Date().toISOString(),
            category: 'other'
        });
        
        this.savingsGoals = this.savingsGoals.filter(g => g.id !== goalId);
        
        APP.saveData();
        this.saveExtendedData();
        this.showNotification('Meta resgatada!', `R$ ${APP.formatMoney(goal.currentAmount)} creditado na sua conta.`, 'success');
        APP.render();
    },

    applyTheme(themeName) {
        const theme = this.THEMES[themeName];
        if (!theme) return;
        
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--secondary', theme.secondary);
        root.style.setProperty('--bg-dark', theme.bgDark);
        root.style.setProperty('--bg-darker', theme.bgDarker);
        root.style.setProperty('--text-light', theme.textLight);
        
        this.currentTheme = themeName;
        this.saveExtendedData();
    },

    showNotification(title, message, type = 'info') {
        const notification = {
            id: 'notif_' + Date.now(),
            title,
            message,
            type,
            timestamp: Date.now(),
            read: false
        };
        
        this.notifications.unshift(notification);
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        this.saveExtendedData();
        this.displayNotificationToast(notification);
    },

    displayNotificationToast(notification) {
        const existingToast = document.getElementById('notification-toast');
        if (existingToast) existingToast.remove();
        
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const colors = { success: '#00C853', error: '#B00020', warning: '#FF9800', info: '#03DAC6' };
        
        const toast = document.createElement('div');
        toast.id = 'notification-toast';
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: ${colors[notification.type]}; color: white;
            padding: 15px 20px; border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
            max-width: 350px; cursor: pointer;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">${icons[notification.type]}</span>
                <div>
                    <div style="font-weight: bold; margin-bottom: 5px;">${notification.title}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${notification.message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        toast.onclick = () => toast.remove();
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    },

    startNotificationSystem() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    },

    unlockAchievement(achievementId) {
        if (this.achievements.includes(achievementId)) return;
        
        const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;
        
        this.achievements.push(achievementId);
        this.addXP(achievement.xp);
        this.saveExtendedData();
        
        this.showNotification(
            `🏆 Conquista desbloqueada!`,
            `${achievement.icon} ${achievement.name} - +${achievement.xp} XP`,
            'success'
        );
    },

    checkAchievements() {
        if (!APP.currentUser) return;
        
        const pixTransactions = APP.transactions.filter(t => 
            t.userId === APP.currentUser.id && (t.type === 'pix_out' || t.type === 'pix_in')
        );
        if (pixTransactions.length > 0) this.unlockAchievement('first_pix');
        
        const userInvestments = APP.investments.filter(i => i.userId === APP.currentUser.id);
        if (userInvestments.length > 0) this.unlockAchievement('first_investment');
        
        if (APP.currentUser.balance >= 1000) this.unlockAchievement('save_1000');
        
        if (this.userLevel >= 10) this.unlockAchievement('level_10');
    },

    addXP(amount) {
        this.userXP += amount;
        this.updateUserLevel();
        this.saveExtendedData();
    },

    updateUserLevel() {
        const xpPerLevel = 1000;
        const newLevel = Math.floor(this.userXP / xpPerLevel) + 1;
        
        if (newLevel > this.userLevel) {
            this.userLevel = newLevel;
            this.showNotification(
                '🎉 Level UP!',
                `Você alcançou o nível ${this.userLevel}!`,
                'success'
            );
        }
    },

    getUserRank() {
        if (this.userLevel < 5) return { name: 'Bronze', icon: '🥉', color: '#CD7F32' };
        if (this.userLevel < 10) return { name: 'Prata', icon: '🥈', color: '#C0C0C0' };
        if (this.userLevel < 20) return { name: 'Ouro', icon: '🥇', color: '#FFD700' };
        return { name: 'Diamante', icon: '💎', color: '#B9F2FF' };
    },

    updateAvatarMood() {
        if (!APP.currentUser) return 'thinking';
        
        const profile = this.analyzeFinancialProfile();
        if (!profile) return 'thinking';
        
        if (profile.savingsRate > 20) return 'celebrate';
        if (profile.savingsRate > 10) return 'happy';
        if (profile.totalExpenses > profile.totalIncome) return 'sad';
        if (APP.currentUser.balance > 5000) return 'money';
        
        return 'thinking';
    },

    addDevice() {
        const device = {
            id: 'device_' + Date.now(),
            name: navigator.userAgent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop',
            browser: this.detectBrowser(),
            lastAccess: new Date().toISOString(),
            current: true
        };
        
        this.devices.push(device);
        this.saveExtendedData();
    },

    detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Outro';
    },

    removeDevice(deviceId) {
        this.devices = this.devices.filter(d => d.id !== deviceId);
        this.saveExtendedData();
        this.showNotification('Dispositivo removido', 'Sessão encerrada com sucesso', 'success');
    },

    generateMonthlyReport() {
        if (!APP.currentUser) return null;
        
        const profile = this.analyzeFinancialProfile();
        const transactions = APP.transactions.filter(t => t.userId === APP.currentUser.id);
        const investments = APP.investments.filter(i => i.userId === APP.currentUser.id);
        const loans = APP.loans.filter(l => l.userId === APP.currentUser.id);
        const insurances = APP.insurances.filter(i => i.userId === APP.currentUser.id);
        const rewards = APP.rewards.filter(r => r.userId === APP.currentUser.id);
        
        const totalRewards = rewards.reduce((sum, r) => sum + r.points, 0);
        const totalInvestmentEarnings = investments.reduce((sum, i) => sum + (i.totalEarnings || 0), 0);
        
        return {
            user: APP.currentUser,
            period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            balance: APP.currentUser.balance,
            profile,
            transactions: transactions.slice(0, 20),
            investments,
            loans,
            insurances,
            totalRewards,
            totalInvestmentEarnings,
            generatedAt: new Date().toISOString()
        };
    }
};

if (typeof APP !== 'undefined') {
    const originalInit = APP.init.bind(APP);
    APP.init = function() {
        originalInit();
        APP_EXTENDED.init();
    };
}
