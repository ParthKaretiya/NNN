declare global {
  interface Window {
    google: any;
  }
}

export const initGoogleLogin = (onLogin: (user: any) => void) => {
  const interval = setInterval(() => {
    if (window.google?.accounts?.id) {
      clearInterval(interval);

      window.google.accounts.id.initialize({
        client_id: "629178944462-ugkktc018d8qoo1bvoemepf2gd1mddgp.apps.googleusercontent.com",
        callback: (response: any) => {
          const payload = JSON.parse(
            atob(response.credential.split(".")[1])
          );

          onLogin({
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            avatar: payload.picture,
            onboarded: false,
          });
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        {
          theme: "outline",
          size: "large",
          width: 320,
        }
      );
    }
  }, 100);
};
