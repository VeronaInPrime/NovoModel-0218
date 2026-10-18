from playwright.sync_api import sync_playwright
from PIL import Image
import json
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':1000},locale='pt-BR');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://localhost:4200');page.wait_for_load_state('networkidle');page.screenshot(path='/home/user/miro-welcome.png',full_page=True)
 page.get_by_role('button',name='Criar minhas ofertas').click()
 page.get_by_role('button',name='Novo produto',exact=True).click()
 page.locator('input[type=file]').set_input_files('/home/user/miro/packages/web/public/images/produce.jpg')
 page.get_by_label('Nome do produto',exact=True).fill('Leite integral')
 page.get_by_label('Preço da oferta',exact=True).fill('4.38')
 page.locator('select[name=unit]').select_option('L')
 page.get_by_label('Descrição da caixa').fill('Caixa com 12 unidades')
 page.get_by_label('Valor total da caixa').fill('52.56')
 page.get_by_role('button',name='Cadastrar produto',exact=True).click()
 page.get_by_role('button',name='Editar Leite integral').wait_for()
 page.get_by_role('button',name='Editar Leite integral').click();page.get_by_label('Nome do produto',exact=True).fill('Leite integral Miro');page.get_by_role('button',name='Salvar alterações').click()
 page.get_by_role('button',name='Criar grupo de ofertas').click();page.get_by_label('Título do grupo').fill('Seleção especial');page.get_by_role('button',name='Criar grupo',exact=True).click()
 page.get_by_role('button',name='Editar Leite integral Miro').click();page.locator('select[name=group]').select_option(label='Seleção especial');page.get_by_role('button',name='Salvar alterações').click()
 page.get_by_role('button',name='Alterar data').click();page.get_by_label('Data da campanha').fill('2026-10-21');page.get_by_role('button',name='Criar minhas ofertas').click();assert page.locator('.offer').count()==0
 page.get_by_role('button',name='Alterar data').click();page.get_by_label('Data da campanha').fill('2026-10-17');page.get_by_role('button',name='Criar minhas ofertas').click();assert page.locator('.offer').count()==1
 page.reload();page.get_by_role('button',name='Criar minhas ofertas').click();assert page.locator('.offer').count()==1
 page.get_by_role('button',name='Exportar encarte',exact=True).click()
 with page.expect_download() as dl:page.get_by_role('button',name='Baixar PNG',exact=True).click()
 dl.value.save_as('/home/user/miro-test-export.png');im=Image.open('/home/user/miro-test-export.png');assert im.width==1080,im.size
 page.get_by_role('button',name='Fechar',exact=True).click()
 page.get_by_role('button',name='Gerar placas',exact=False).first.click();page.get_by_role('button',name='Gerar placas',exact=True).click();assert page.locator('.print-sign').count()==1
 page.locator('.print-sign h2').fill('Leite integral editado');assert page.locator('.print-sign h2').inner_text()=='Leite integral editado'
 page.get_by_role('button',name='Fechar',exact=True).click()
 page.get_by_role('button',name='QR Code do WhatsApp').click();page.get_by_label('Link do grupo do WhatsApp',exact=True).fill('https://chat.whatsapp.com/MiroTeste');page.locator('.qr-sheet img').wait_for();page.get_by_role('button',name='Salvar link').click()
 with page.expect_download() as dl:page.get_by_role('button',name='Baixar convite').click()
 dl.value.save_as('/home/user/miro-test-qr.png');page.get_by_role('button',name='Fechar',exact=True).click()
 page.screenshot(path='/home/user/miro-editor.png',full_page=True)
 mobile=b.new_page(viewport={'width':390,'height':844},locale='pt-BR',is_mobile=True,has_touch=True);mobile.goto('http://localhost:4200');mobile.wait_for_load_state('networkidle');mobile.screenshot(path='/home/user/miro-mobile.png',full_page=True);assert not mobile.evaluate('document.documentElement.scrollWidth>innerWidth')
 mobile.get_by_role('button',name='Criar minhas ofertas').click();assert not mobile.evaluate('document.documentElement.scrollWidth>innerWidth');mobile.get_by_role('button',name='Abrir menu').click();mobile.get_by_role('button',name='Cadastrar produto').click();assert mobile.get_by_role('dialog').is_visible();mobile.get_by_role('button',name='Fechar',exact=True).click();mobile.screenshot(path='/home/user/miro-mobile-editor.png',full_page=True)
 print(json.dumps({'tests':'CRUD, groups, date isolation, weekend sharing, reload persistence, PNG 1080px, editable plates, QR export, mobile overflow, menu passed','PNG':im.size,'browser_errors':errors},ensure_ascii=False));b.close()
