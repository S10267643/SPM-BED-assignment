document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('mouseover', () => {
        tab.style.fontWeight = 'bold';
        tab.style.color = '#00ADB5';
    });

    tab.addEventListener('mouseout', () => {
        tab.style.fontWeight = 'normal';
        tab.style.color = '#333';
    });
});