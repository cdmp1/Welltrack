import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';


export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const storage = inject(Storage);

  const userId = await storage.get('userId');

  if (!userId) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
