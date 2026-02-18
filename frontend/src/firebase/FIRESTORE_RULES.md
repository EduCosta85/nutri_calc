# Firebase Firestore Security Rules

## Regras de Segurança para Produção

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuário só pode acessar seus próprios dados
    match /users/{userId} {
      // Permite leitura/escrita apenas se o ID do usuário autenticado
      // for igual ao userId no path
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Matérias-primas do usuário
    match /users/{userId}/rawMaterials/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Receitas do usuário
    match /users/{userId}/recipes/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Como Configurar

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para **Firestore Database** > **Regras**
4. Cole as regras acima
5. Clique em **Publicar**

## Modo de Teste (Para Desenvolvimento)

Durante o desenvolvimento, você pode usar o modo de teste:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite acesso total para desenvolvimento
    // ATENÇÃO: Remova antes de publicar em produção!
    allow read, write: if true;
  }
}
```

## Estrutura de Dados no Firestore

```
users/
  {userId}/
    rawMaterials/
      {documentId}/
        - name: string
        - unit: string
        - tags: string[]
        - pricePer100g: number
        - caloriesPer100g: number
        - ...outros campos
    
    recipes/
      {documentId}/
        - name: string
        - tags: string[]
        - yieldGrams: number
        - servingSize: number
        - servingName: string
        - ingredients: array
        - steps: array
        - prepTimeMin: number
        - photo: string (opcional)
```

## Configuração no Firebase Console

### 1. Autenticação
- Vá em **Authentication** > **Sign-in method**
- Habilite **Email/Password**
- Habilite **Google** (opcional)

### 2. Firestore
- Vá em **Firestore Database** > **Criar banco de dados**
- Selecione uma região (ex: us-central1)
- Comece em **Modo de teste** (depois configure as regras)

### 3. Variáveis de Ambiente
Crie o arquivo `frontend/.env.local` com as credenciais do seu projeto Firebase:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...
```
