/**
 * OAuth2 창을 열고 창 상태를 추적하는 유틸리티 함수
 * @param {string} url - OAuth2 인증 URL
 * @param {string} windowName - 인증 창 이름
 * @param {Object} options - 창 옵션 및 콜백
 * @param {number} options.width - 창 너비 (기본값: 580)
 * @param {number} options.height - 창 높이 (기본값: 600)
 * @param {function} options.onClose - 창이 닫힐 때 실행할 콜백 함수
 * @returns {Window} 열린 창 객체
 */
export function openOAuth2Window(url, windowName = 'OAuth2_Auth', options = {}) {
    const { width = 580, height = 600, onClose = null } = options;

    // 새 창 중앙 배치 계산
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // 새 창 열기
    const authWindow = window.open(url, windowName, `width=${width},height=${height},top=${top},left=${left}`);

    // 창 닫힘 감지 (선택적)
    if (onClose) {
        const checkWindow = setInterval(() => {
            if (authWindow?.closed) {
                clearInterval(checkWindow);
                onClose();
            }
        }, 500);
    }

    return authWindow;
}

/**
 * OAuth2 인증 URL 생성 유틸리티
 * @param {Object} params - OAuth2 파라미터
 * @param {string} params.authUrl - 인증 기본 URL
 * @param {string} params.clientId - 클라이언트 ID
 * @param {string} params.redirectUri - 리디렉션 URI
 * @param {string} params.scope - 요청 스코프
 * @param {string} params.state - 상태 파라미터
 * @param {Object} params.additionalParams - 추가 파라미터 객체
 * @returns {string} 완성된 OAuth2 URL
 */
export function buildOAuth2Url(params) {
    const { authUrl, clientId, redirectUri, scope, state, additionalParams = {} } = params;

    const url = new URL(authUrl);
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', state);

    // 추가 파라미터 처리
    Object.entries(additionalParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    return url.toString();
}

/**
 * 랜덤 state 문자열 생성 유틸리티
 * @returns {string} 랜덤 상태 문자열
 */
export function generateOAuthState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
