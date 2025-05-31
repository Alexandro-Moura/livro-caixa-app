// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => {
          console.log('ServiceWorker registrado com sucesso');
        })
        .catch(err => {
          console.log('ServiceWorker registro falhou: ', err);
        });
    });
  }


document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let balance = parseFloat(localStorage.getItem('balance')) || 0;
    
    // Elementos DOM
    const transactionForm = document.getElementById('transaction-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');
    const paymentMethodSelect = document.getElementById('payment-method');
    const dateInput = document.getElementById('date');
    const currentBalanceElement = document.getElementById('current-balance');
    const transactionsTable = document.getElementById('transactions-table').getElementsByTagName('tbody')[0];
    const filterTypeSelect = document.getElementById('filter-type');
    const filterDateInput = document.getElementById('filter-date');
    const applyFiltersButton = document.getElementById('apply-filters');
    
    // Inicialização
    updateBalance();
    renderTransactions();
    setCurrentDate();
    
    // Event Listeners
    transactionForm.addEventListener('submit', addTransaction);
    applyFiltersButton.addEventListener('click', renderTransactions);
    
    // Funções
    function setCurrentDate() {
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        dateInput.value = formattedDate;
    }
    
    function addTransaction(e) {
        e.preventDefault();
        
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeSelect.value;
        const paymentMethod = paymentMethodSelect.value;
        const date = dateInput.value;
        
        if (!description || isNaN(amount)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            paymentMethod,
            date
        };
        
        transactions.unshift(transaction);
        
        if (type === 'income') {
            balance += amount;
        } else {
            balance -= amount;
        }
        
        saveToLocalStorage();
        updateBalance();
        renderTransactions();
        
        // Reset form
        transactionForm.reset();
        setCurrentDate();
    }
    
    function updateBalance() {
        currentBalanceElement.textContent = `R$ ${balance.toFixed(2)}`;
        currentBalanceElement.className = balance >= 0 ? 'income' : 'expense';
    }
    
    function renderTransactions() {
        // Limpar tabela
        transactionsTable.innerHTML = '';
        
        // Aplicar filtros
        let filteredTransactions = [...transactions];
        const filterType = filterTypeSelect.value;
        const filterDate = filterDateInput.value;
        
        if (filterType !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
        }
        
        if (filterDate) {
            filteredTransactions = filteredTransactions.filter(t => t.date === filterDate);
        }
        
        // Adicionar transações filtradas à tabela
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR');
            const formattedAmount = transaction.amount.toFixed(2);
            const paymentMethodText = getPaymentMethodText(transaction.paymentMethod);
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td class="${transaction.type}">${transaction.type === 'income' ? 'Entrada' : 'Saída'}</td>
                <td>${paymentMethodText}</td>
                <td class="${transaction.type}">R$ ${formattedAmount}</td>
                <td><button class="delete-btn" data-id="${transaction.id}">Excluir</button></td>
            `;
            
            transactionsTable.appendChild(row);
        });
        
        // Adicionar event listeners aos botões de exclusão
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteTransaction(id);
            });
        });
    }
    
    function getPaymentMethodText(method) {
        const methods = {
            'cash': 'Dinheiro',
            'debit': 'Débito',
            'credit': 'Crédito',
            'transfer': 'Transferência',
            'other': 'Outro'
        };
        return methods[method] || method;
    }
    
    function deleteTransaction(id) {
        const transactionIndex = transactions.findIndex(t => t.id === id);
        
        if (transactionIndex === -1) return;
        
        const transaction = transactions[transactionIndex];
        
        if (transaction.type === 'income') {
            balance -= transaction.amount;
        } else {
            balance += transaction.amount;
        }
        
        transactions.splice(transactionIndex, 1);
        
        saveToLocalStorage();
        updateBalance();
        renderTransactions();
    }
    
    function saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('balance', balance.toString());
    }
});