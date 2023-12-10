type ScraperHandlerErrorCode = typeof ScraperHandlerError.ERROR_CODES[number]

class ScraperHandlerError extends Error {
    handler: string
    code: ScraperHandlerErrorCode

    static ERROR_CODES = [
        "DATA_NOT_FOUND"
    ] as const

    constructor(handler: string, code: ScraperHandlerErrorCode){
        super()

        if(!Object.keys(ScraperHandlerError.ERROR_CODES).includes(code)) {
            throw new Error(`ScraperHandlerError invalid ERROR_CODES: ${handler}, ${code}`)
        }

        this.name = "ScraperHandlerError";
        this.handler = handler
        this.code = code
        this.message = this.getErrorMessage()
    }

    getErrorMessage(){
        const messages = {
            1: `Invalid handler ${this.handler}: Data not found`
        }
        
        return messages[this.code]
    }
}

export default ScraperHandlerError