#!/bin/bash

# GitHub Personal Access Token 설정 스크립트

echo "🔐 GitHub Personal Access Token 설정"
echo ""

# 1. 현재 원격 저장소 확인
echo "📋 현재 원격 저장소:"
git remote -v
echo ""

# 2. Git Credential Helper 설정 (macOS)
echo "⚙️  Git Credential Helper 설정 중..."
git config --global credential.helper osxkeychain
echo "✅ 설정 완료"
echo ""

# 3. 원격 저장소 URL 확인 및 안내
REMOTE_URL=$(git config --get remote.origin.url)
echo "📍 원격 저장소 URL: $REMOTE_URL"
echo ""

if [[ $REMOTE_URL == *"https"* ]]; then
    echo "✅ HTTPS URL 사용 중"
    echo ""
    echo "📝 다음 단계:"
    echo "1. GitHub에서 Personal Access Token 생성 (ghp_xxxxx 형식)"
    echo "2. 다음 명령어로 푸시 시도:"
    echo "   git push origin main"
    echo "3. Username: GitHub 사용자명 입력"
    echo "4. Password: Personal Access Token 입력 (토큰 값)"
    echo ""
    echo "💡 토큰은 macOS 키체인에 저장되어 다음부터는 자동으로 사용됩니다."
elif [[ $REMOTE_URL == *"git@"* ]]; then
    echo "ℹ️  SSH URL 사용 중"
    echo ""
    echo "SSH를 사용하는 경우 Personal Access Token이 필요하지 않습니다."
    echo "SSH 키가 제대로 설정되어 있는지 확인하세요:"
    echo "  ssh -T git@github.com"
else
    echo "⚠️  원격 저장소가 설정되지 않았습니다."
    echo ""
    echo "원격 저장소를 추가하세요:"
    echo "  git remote add origin https://github.com/USERNAME/REPO.git"
fi

echo ""
echo "📚 자세한 내용은 .github/SETUP_TOKEN.md 파일을 참고하세요."

