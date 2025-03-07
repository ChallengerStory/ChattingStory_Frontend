// src/utils/oauth2.js

/**
 * OAuth2 상태 문자열 생성
 * @returns {string} 랜덤 상태 문자열
 */
export const generateOAuthState = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * OAuth2 URL 생성
 * @param {Object} options - OAuth2 옵션
 * @param {string} options.authUrl - 인증 URL
 * @param {string} options.clientId - 클라이언트 ID
 * @param {string} options.redirectUri - 리디렉션 URI
 * @param {string} options.scope - 범위
 * @param {string} options.state - 상태
 * @param {Object} options.additionalParams - 추가 파라미터
 * @returns {string} 완성된 OAuth2 URL
 */
export const buildOAuth2Url = ({ authUrl, clientId, redirectUri, scope, state, additionalParams = {} }) => {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        state,
        ...additionalParams
    });

    return `${authUrl}?${params.toString()}`;
};

/**
 * OAuth2 팝업 창 열기
 * @param {string} url - 인증 URL
 * @param {string} title - 창 제목
 * @param {Object} options - 창 옵션
 * @param {number} options.width - 창 너비
 * @param {number} options.height - 창 높이
 * @param {Function} options.onClose - 창 닫힘 이벤트 핸들러
 * @returns {Window} 팝업 창 객체
 */
export const openOAuth2Window = (url, title, { width = 500, height = 600, onClose } = {}) => {
    // 창 위치 계산 (중앙 정렬)
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // 팝업 창 특성
    const features = [`width=${width}`, `height=${height}`, `left=${left}`, `top=${top}`, 'resizable=yes', 'scrollbars=yes'].join(',');

    // 창 열기
    const popup = window.open(url, title, features);

    // COOP 정책으로 인한 window.closed 접근 제한 문제 해결
    // 창 닫힘을 직접 감지하는 대신 localStorage 이벤트에 의존
    if (onClose) {
        // 팝업 창이 닫히면 로컬스토리지에 플래그를 설정할 수 있도록
        // 함수를 window 객체에 추가 (팝업에서 접근 가능)
        window.handlePopupClosed = () => {
            // 팝업이 닫힐 때 이 함수가 호출될 것임
            onClose();
        };
    }

    return popup;
};
