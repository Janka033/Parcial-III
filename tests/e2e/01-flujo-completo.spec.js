import { test, expect } from '@playwright/test';

test.describe('Sistema de Citas Medicas - Flujo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/../frontend/index.html');
  });

  test('Flujo completo: Registro de paciente y agendamiento de cita exitoso', async ({ page }) => {
    const timestamp = Date.now();
    const nombre = `Juan Perez ${timestamp}`;
    const email = `juan.perez${timestamp}@email.com`;
    const telefono = '+51987654321';

    await page.fill('#nombre', nombre);
    await page.fill('#email', email);
    await page.fill('#telefono', telefono);
    await page.click('button[type="submit"]');

    await expect(page.locator('#mensajePaciente')).toContainText('exitosamente');

    await page.waitForSelector(`#pacienteId option:has-text("${nombre}")`);
    await page.selectOption('#pacienteId', { label: new RegExp(nombre) });
    await page.fill('#doctor', 'Dr. Rodriguez');
    await page.fill('#fecha', '2025-12-15');
    await page.fill('#hora', '10:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');

    await page.click('#btnActualizar');

    await expect(page.locator('.cita-card')).toContainText(nombre);
    await expect(page.locator('.cita-card')).toContainText('Dr. Rodriguez');
  });
});
