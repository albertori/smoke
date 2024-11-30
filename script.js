document.addEventListener('DOMContentLoaded', function() {
    const selectedBases = new Set();
    
    // Gestione selezione basi
    document.querySelectorAll('.base-option').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const strength = this.dataset.strength;
            if (this.classList.contains('btn-primary')) {
                this.classList.remove('btn-primary');
                this.classList.add('btn-outline-primary');
                selectedBases.delete(parseInt(strength));
            } else {
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-primary');
                selectedBases.add(parseInt(strength));
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
        
        if (selectedBases.size === 0) {
            alert('Seleziona almeno una base di nicotina');
            return;
        }
        
        // Converti Set in array e ordina
        const bases = Array.from(selectedBases).sort((a, b) => b - a);
        
        // Calcola le quantità necessarie
        const targetNicotine = finalAmount * targetStrength;
        let remainingNicotine = targetNicotine;
        let remainingVolume = finalAmount;
        const results = [];
        
        for (const baseStrength of bases) {
            if (remainingNicotine <= 0 || remainingVolume <= 0) break;
            
            // Calcola quanti shot da 10ml sono necessari
            const maxShots = Math.floor(remainingNicotine / (baseStrength * 10));
            if (maxShots > 0) {
                const shotsToUse = Math.min(maxShots, Math.floor(remainingVolume / 10));
                if (shotsToUse > 0) {
                    results.push({
                        strength: baseStrength,
                        shots: shotsToUse
                    });
                    
                    remainingNicotine -= shotsToUse * baseStrength * 10;
                    remainingVolume -= shotsToUse * 10;
                }
            }
        }
        
        // Mostra i risultati
        const resultDiv = document.getElementById('calculationResult');
        resultDiv.innerHTML = '';
        
        if (results.length > 0) {
            // Calcola la concentrazione effettiva
            let totalNicotine = 0;
            let totalVolume = 0;
            
            results.forEach(result => {
                totalNicotine += result.shots * result.strength * 10;
                totalVolume += result.shots * 10;
                
                const item = document.createElement('div');
                item.className = 'calculation-item';
                item.innerHTML = `
                    <strong>${result.shots}</strong> base${result.shots > 1 ? 'i' : ''} da 10ml a ${result.strength}mg/ml
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
                totalVolume += remainingVolume;
            }
            
            // Aggiungi il risultato esatto
            const exactStrength = totalNicotine / totalVolume;
            const exactResult = document.createElement('div');
            exactResult.className = 'exact-result mt-3 p-3 bg-primary bg-opacity-10 rounded';
            exactResult.innerHTML = `
                <strong>Risultato esatto:</strong> ${Math.round(exactStrength * 100) / 100}mg/ml 
                in ${totalVolume}ml totali
            `;
            resultDiv.appendChild(exactResult);
            
        } else {
            resultDiv.innerHTML = '<div class="alert alert-warning">Non è possibile raggiungere la concentrazione desiderata con le basi selezionate</div>';
        }
    });
}); 