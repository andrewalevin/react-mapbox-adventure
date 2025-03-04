import {isHTML} from "./utils";

export const createAboutSpotElement = (content) => {
    const container = document.createElement('div');
    container.className = 'popup-about';
    container.innerHTML = isHTML(content) ? content : `<p>${content}</p>`;
    return container;
};

export const createTitleSpotElement = (content) => {
    const container = document.createElement('div');
    container.className = 'popup-title';
    container.innerHTML = isHTML(content) ? content : `<h6 class="fw-bold">${content}</h6>`;
    return container;
};

export const createImgSpotElement = (imgPath) => {
    const container = document.createElement('div');
    container.className = 'popup-img-container';
    container.innerHTML = `<img loading="lazy" alt="" src="${imgPath}">`;
    return container;
};

export const createLinksSpotElement = (markerPopupElem, links) => {
    if (!links || !markerPopupElem) return null;  // Make sure both are valid

    const createLinkElement = (link) =>
        isHTML(link) ? link : `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`;

    const generateInnerHTML = () => {
        if (typeof links === "string") return createLinkElement(links);
        if (Array.isArray(links)) return links.map(createLinkElement).join('<br>'); // Separate links with line breaks
        return '';
    };

    const innerHTML = generateInnerHTML();
    if (!innerHTML) return null;  // Ensure something is returned

    const linkContainer = document.createElement('div');
    linkContainer.className = 'popup-link';
    linkContainer.innerHTML = innerHTML;
    return linkContainer;
};

export function createRouteElement(routeTitle, distance) {
    const div = document.createElement("div");

    const title = document.createElement("b");
    title.textContent = routeTitle;

    const lineBreak = document.createElement("br");

    const distanceText = document.createTextNode(`Distance: ${distance} km`);

    div.appendChild(title);
    div.appendChild(lineBreak);
    div.appendChild(distanceText);

    return div;
}


export function piecewiseLinear(inputX, startX, startY, endX, endY) {
    if (inputX <= startX) return startY;
    if (inputX >= endX) return endY;
    return startY + (endY - startY) * (inputX - startX) / (endX - startX);
}