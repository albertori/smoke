document.addEventListener('DOMContentLoaded', function() {
    // Aggiungi base
    document.getElementById('addBase').addEventListener('click', function() {
        const template = document.querySelector('.nicotine-base-row').cloneNode(true);
        template.querySelector('.base-strength').value = '';
        document.getElementById('nicotineBases').appendChild(template);
        
        // Aggiungi event listener al nuovo pulsante di rimozione
        template.querySelector('.remove-base').addEventListener('click', function() {
            if (document.querySelectorAll('.nicotine-base-row').length > 1) {
                this.closest('.nicotine-base-row').remove();
            }
        });
    });
    
    // Rimuovi base
    document.querySelectorAll('.remove-base').forEach(button => {
        button.addEventListener('click', function() {
            if (document.querySelectorAll('.nicotine-base-row').length > 1) {
                this.closest('.nicotine-base-row').remove();
            }
        });
    });
    
    // Calcola
    document.getElementById('calculateAdvanced').addEventListener('click', function() {
        const finalAmount = parseFloat(document.getElementById('finalAmount').value);
        const targetStrength = parseFloat(document.getElementById('targetStrength').value);
        
        if (!finalAmount || !targetStrength) {
            alert('Inserisci tutti i valori richiesti');
            return;
        }
        
        const bases = [];
        document.querySelectorAll('.nicotine-base-row').forEach(row => {
            const strength = parseFloat(row.querySelector('.base-strength').value);
            const type = row.querySelector('.base-type').value;
            if (strength) {
                bases.push({ strength, type });
            }
        });
        
        if (bases.length === 0) {
            alert('Aggiungi almeno una base di nicotina');
            return;
        }
        
        // Ordina le basi dalla più forte alla più debole
        bases.sort((a, b) => b.strength - a.strength);
        
        // Calcola le quantità necessarie
        let remainingNicotine = finalAmount * targetStrength;
        let remainingVolume = finalAmount;
        const results = [];
        
        for (const base of bases) {
            if (remainingNicotine <= 0 || remainingVolume <= 0) break;
            
            const maxVolumeFromThisBase = Math.min(
                remainingVolume,
                (remainingNicotine / base.strength) * 1
            );
            
            if (maxVolumeFromThisBase > 0) {
                results.push({
                    strength: base.strength,
                    type: base.type,
                    volume: Math.round(maxVolumeFromThisBase * 10) / 10
                });
                
                remainingNicotine -= maxVolumeFromThisBase * base.strength;
                remainingVolume -= maxVolumeFromThisBase;
            }
        }
        
        // Mostra i risultati
        const resultDiv = document.getElementById('calculationResult');
        resultDiv.innerHTML = '';
        
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'calculation-item';
            item.innerHTML = `
                <strong>${result.volume}ml</strong> di base ${result.strength}mg/ml (${result.type.toUpperCase()})
            `;
            resultDiv.appendChild(item);
        });
        
        if (remainingVolume > 0) {
            const item = document.createElement('div');
            item.className = 'calculation-item';
            item.innerHTML = `
                <strong>${Math.round(remainingVolume * 10) / 10}ml</strong> di base neutra
            `;
            resultDiv.appendChild(item);
        }
    });
}); 