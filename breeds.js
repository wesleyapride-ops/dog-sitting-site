// ============================================
// GenusPupClub — Dog Breeds Database
// Shared across all forms
// ============================================

const DOG_BREEDS = [
    'Affenpinscher','Afghan Hound','Airedale Terrier','Akita','Alaskan Malamute',
    'American Bulldog','American Eskimo Dog','American Pit Bull Terrier','American Staffordshire Terrier',
    'Australian Cattle Dog','Australian Shepherd','Basenji','Basset Hound','Beagle',
    'Bearded Collie','Belgian Malinois','Bernese Mountain Dog','Bichon Frise','Bloodhound',
    'Border Collie','Border Terrier','Boston Terrier','Boxer','Brittany',
    'Brussels Griffon','Bull Terrier','Bulldog (English)','Bulldog (French)','Bullmastiff',
    'Cairn Terrier','Cane Corso','Cavalier King Charles Spaniel','Chesapeake Bay Retriever',
    'Chihuahua','Chinese Crested','Chinese Shar-Pei','Chow Chow','Cocker Spaniel',
    'Collie','Corgi (Pembroke Welsh)','Corgi (Cardigan Welsh)','Dachshund','Dalmatian',
    'Doberman Pinscher','Dogue de Bordeaux','English Setter','English Springer Spaniel',
    'Finnish Spitz','German Pinscher','German Shepherd','German Shorthaired Pointer',
    'Giant Schnauzer','Golden Retriever','Goldendoodle','Gordon Setter','Great Dane',
    'Great Pyrenees','Greyhound','Havanese','Husky (Siberian)','Irish Setter',
    'Irish Wolfhound','Italian Greyhound','Jack Russell Terrier','Japanese Chin',
    'Keeshond','Kerry Blue Terrier','Labradoodle','Labrador Retriever','Lhasa Apso',
    'Maltese','Maltipoo','Mastiff','Miniature Pinscher','Miniature Schnauzer',
    'Newfoundland','Norfolk Terrier','Norwegian Elkhound','Old English Sheepdog',
    'Papillon','Pekingese','Pointer','Pomeranian','Poodle (Standard)',
    'Poodle (Miniature)','Poodle (Toy)','Portuguese Water Dog','Pug','Rat Terrier',
    'Rhodesian Ridgeback','Rottweiler','Saint Bernard','Samoyed','Schipperke',
    'Scottish Terrier','Shetland Sheepdog','Shiba Inu','Shih Tzu','Staffordshire Bull Terrier',
    'Standard Schnauzer','Vizsla','Weimaraner','Welsh Terrier','West Highland White Terrier',
    'Whippet','Wire Fox Terrier','Yorkshire Terrier',
    'Mixed Breed','Other'
];

// Render a searchable breed dropdown
const breedSelectHTML = (id, selected = '', placeholder = 'Select breed') => {
    const options = DOG_BREEDS.map(b =>
        `<option value="${b}" ${selected === b ? 'selected' : ''}>${b}</option>`
    ).join('');
    return `<select class="form-select breed-select" id="${id}" style="max-height:200px">
        <option value="">${placeholder}</option>
        ${options}
    </select>`;
};

// Make breed selects searchable with a filter input
const initBreedSearch = (selectId) => {
    const sel = document.getElementById(selectId);
    if (!sel || sel.dataset.searchInit) return;
    sel.dataset.searchInit = 'true';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;';
    sel.parentNode.insertBefore(wrapper, sel);

    const search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Type to search breeds...';
    search.className = 'form-input';
    search.style.cssText = 'margin-bottom:4px;font-size:.85rem;padding:8px 10px;';

    wrapper.appendChild(search);
    wrapper.appendChild(sel);

    const allOptions = [...sel.options];
    search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        sel.innerHTML = '';
        allOptions.forEach(opt => {
            if (!q || opt.value.toLowerCase().includes(q) || opt.textContent.toLowerCase().includes(q)) {
                sel.appendChild(opt.cloneNode(true));
            }
        });
    });
};
