// Three-step booking wizard: where it hurts → visit type → contact details.
// Relies on validateField() from script.js and the "painselect" event from pain-locator.js.
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-booking-wizard]').forEach(initWizard);
});

function initWizard(form) {
    const steps = Array.from(form.querySelectorAll('.wizard-step'));
    const progress = Array.from(form.querySelectorAll('.wizard-progress li'));
    const concern = form.querySelector('[name="Concern"]');
    const area = form.querySelector('[name="Pain area"]');
    const summary = form.querySelector('.pain-summary');
    const choices = form.querySelector('.pain-choices');
    const locator = form.querySelector('[data-pain-locator]');
    const suburbGroup = form.querySelector('.suburb-group');
    let current = 0;

    function show(index, initial) {
        current = index;
        steps.forEach(function (step, i) {
            step.hidden = i !== index;
            step.classList.toggle('active', i === index);
        });
        progress.forEach(function (item, i) {
            item.classList.toggle('active', i === index);
            item.classList.toggle('done', i < index);
            if (i === index) item.setAttribute('aria-current', 'step');
            else item.removeAttribute('aria-current');
        });
        if (initial) return;
        const heading = steps[index].querySelector('h3');
        if (heading) heading.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function stepIsValid(index) {
        let valid = true;
        let first = null;
        steps[index].querySelectorAll('input, select, textarea').forEach(function (field) {
            if (field.closest('[hidden]') && field.closest('[hidden]') !== steps[index]) return;
            if (!validateField(field)) {
                valid = false;
                first = first || field;
            }
        });
        if (first) first.focus();
        return valid;
    }

    form.querySelectorAll('[data-next]').forEach(function (button) {
        button.addEventListener('click', function () {
            if (stepIsValid(current)) show(current + 1);
        });
    });
    form.querySelectorAll('[data-back]').forEach(function (button) {
        button.addEventListener('click', function () { show(current - 1); });
    });

    // A tap on the model (or a region button) selects the matching condition
    function selectRegion(detail) {
        area.value = detail.label;
        summary.innerHTML = 'You pointed to: <strong>' + detail.label + '</strong>';
        choices.innerHTML = '';
        detail.options.forEach(function (option, i) {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'pain-chip' + (i === 0 ? ' selected' : '');
            chip.textContent = option;
            chip.setAttribute('aria-pressed', String(i === 0));
            chip.addEventListener('click', function () {
                choices.querySelectorAll('.pain-chip').forEach(function (c) {
                    c.classList.remove('selected');
                    c.setAttribute('aria-pressed', 'false');
                });
                chip.classList.add('selected');
                chip.setAttribute('aria-pressed', 'true');
                setConcern(option);
            });
            choices.appendChild(chip);
        });
        setConcern(detail.options[0]);
    }

    function setConcern(value) {
        concern.value = value;
        clearFieldError(concern);
    }

    if (locator) {
        locator.addEventListener('painselect', function (e) { selectRegion(e.detail); });
    }
    form.querySelectorAll('[data-region]').forEach(function (button) {
        button.addEventListener('click', function () {
            selectRegion({ label: button.dataset.label, options: button.dataset.options.split('|') });
        });
    });

    // Picking from the dropdown directly clears the marker so the two never disagree
    concern.addEventListener('change', function () {
        const fromChip = choices.querySelector('.pain-chip.selected');
        if (fromChip && fromChip.textContent === concern.value) return;
        area.value = '';
        summary.textContent = '';
        choices.innerHTML = '';
        if (locator) locator.dispatchEvent(new CustomEvent('painclear'));
    });

    // Suburb only matters for home visits
    form.querySelectorAll('[name="Visit type"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            const home = form.querySelector('[name="Visit type"]:checked').value.indexOf('Home visit') === 0;
            suburbGroup.hidden = !home;
            suburbGroup.querySelector('input').required = home;
        });
    });

    form.addEventListener('booking:sent', function () {
        form.classList.add('sent');
        progress.forEach(function (item) { item.classList.add('done'); item.classList.remove('active'); });
    });

    // If the 3D library never loads (offline, blocked CDN), fall back to the area buttons
    const painLocator = form.querySelector('.pain-locator');
    if (painLocator) {
        window.addEventListener('load', function () {
            setTimeout(function () {
                if (!painLocator.classList.contains('ready')) painLocator.classList.add('no-3d');
            }, 3000);
        });
    }

    show(0, true);
}
