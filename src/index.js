import LinksGenerator from 'atomichub-autogenerate-claimlinks'
import Excel from 'exceljs'

const $buttonLogin = document.body.querySelector('button#login')
const $blockGenerate = document.body.querySelector('#generate-block')
const $blockLinks = document.body.querySelector('#links')
const $inputName = $blockGenerate.querySelector('input')
const $buttonGenerate = $blockGenerate.querySelector('button#generate')
const $buttonDownload = $blockGenerate.querySelector('button#download')
const $spanProcess = $blockGenerate.querySelector('#process')
const $spanCompeted = $blockGenerate.querySelector('#completed')

const atomic = new LinksGenerator(undefined, undefined, true, false)
let links = []

$buttonLogin.onclick = async () => {
    const account = await atomic.login()
    console.info('Success login:', account)
    $buttonLogin.classList.remove('show')
    $blockGenerate.classList.add('show')
}

$buttonGenerate.onclick = async () => {
    links = []
    $spanCompeted.classList.remove('show')
    $spanProcess.classList.add('show')
    $blockLinks.classList.remove('show')
    $buttonDownload.classList.remove('show')

    const name = $inputName.value
    try {
        const assetPages = await atomic.getAssetIDs(name, 50)
        for (const assetIDs of assetPages) {
            const linkPage = await atomic.generateClaimLinks(assetIDs)
            for (const link of linkPage) {
                links.push(link)
            }
        }
    } catch (error) {
        alert('Произошла ошибка. Были сгенерированы не все ссылки, уже сгенерированные показаны на странице.\nОписание ошибки:\n'+error+'\n'+error.message)
    }

    $blockLinks.insertAdjacentHTML('beforeend', links.map(link => `<a href="${link}" target="_blank">${link}</a>`).join(''))
    await downloadExcel()
    $blockLinks.classList.add('show')
    $inputName.value = ''
    $spanProcess.classList.remove('show')
    $spanCompeted.classList.add('show')
    $buttonDownload.classList.add('show')
}

$buttonDownload.onclick = async () => {
    console.log(await downloadExcel())
}

async function downloadExcel() {
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Claim Links')
    worksheet.columns = [{width: 110, key: 'link'}]
    for (const link of links) {
        worksheet.addRow({link}).commit()
    }
    const buffer = await workbook.xlsx.writeBuffer({filename: 'claimlinks.xlsx'})

    let a = document.createElement("a")
    let file = new Blob([buffer], {type: 'application/json'})
    a.href = URL.createObjectURL(file)
    a.download = 'claimlinks.xlsx'
    a.click()
    a.remove()
    console.log('Excel file created')
    return buffer
}
