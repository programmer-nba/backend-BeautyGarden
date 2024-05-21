const Picture64 = require("../../models/admin/picture64.model")
const { Quotation } = require("../../models/admin/quotation.models")

exports.uploadPictures = async (req, res) => {
    const { quotationId } = req.body;
    try {
        let quotation = await Quotation.findById(quotationId)
        //let mainQuotation = await Quotation.findById(quotationId)
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found!" });
        }
        if (!quotation.product_detail.length) {
            return res.status(404).json({ message: "No products in quotation" });
        }
        const prodIds = quotation.product_detail.map(pId => pId._id)
        //const existPictures = await Picture64.find( { refId: {$in: prodIds} } )
        const uploadPictures = quotation.product_detail.map(async (prod) => {
            const logos = prod.product_logo.map(async (logo) => {
                try {
                    if(prodIds.includes(prod._id)) {
                        return
                    }
                    const newPicture = {
                        base64: logo,
                        refId: prod._id,
                    }
                    const picture64 = new Picture64(newPicture)
                    const saved_picture64 = await picture64.save();
                    if (!saved_picture64) {
                        throw new Error('Cannot save picture');
                    }
                    return saved_picture64;
                } catch (error) {
                    console.error('Error saving picture:', error);
                    throw error;
                }
            });
            return Promise.all(logos);
        })

        const uploadedPictures = await Promise.all(uploadPictures)

        /* mainQuotation.product_detail.forEach(prod => prod.product_logo = [])
        const saved_quotation = await mainQuotation.save()
        if(!saved_quotation) {
            return res.json({message: 'can not saved quotation!'})
        } */

        return res.status(200).json({
            message: 'Success!',
            status: true,
            data: uploadedPictures,
            //mainData: mainQuotation
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message,
        });
    }
}

exports.uploadPicture = async (req, res) => {
    const { base64, refId } = req.body
    try {
        const newPicture = {
            base64: base64,
            refId: refId
        }
        const picture64 = new Picture64(newPicture)
        const saved_picture64 = await picture64.save()
        if (!saved_picture64) return res.json({ message: 'can not saved!' })
        
        return res.status(200).json({
            message: 'success!',
            status: true,
            data: saved_picture64
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updatePicture = async (req, res) => {
    const { base64 } = req.body
    const { id } = req.params
    try {
        let picture64 = await Picture64.findById( id )
        if (!picture64) return res.status(404).json({ message: 'not found' })

        picture64.base64 = base64 || picture64.base64
        const saved_picture64 = await picture64.save()
        if (!picture64) return res.json({message: 'can not save!'})
        
        return res.status(200).json({
            message: 'success!',
            status: true,
            data: saved_picture64
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getPictureByRefs = async (req, res) => {
    const { refId } = req.params
    try {
        const picture64 = await Picture64.findOne( { refId: refId } )
        if (!picture64) return res.status(404).json({ message: 'picture not found' })
        
        return res.status(200).json({
            message: 'success!',
            status: true,
            data: picture64
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deletePictureByRefs = async (req, res) => {
    const { refId } = req.params
    try {
        const picture64 = await Picture64.deleteOne( { refId: refId } )
        if (!picture64) return res.status(404).json({ message: 'picture not found' })
        
        return res.status(200).json({
            message: 'success!',
            status: true,
            data: picture64.deletedCount
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteProduct_logos = async (req, res) => {
    const { id } = req.params
    try {
        let quotation = await Quotation.findById(id)
        if(!quotation){
        return res.status(404).json({
            message: "not founded quotation"
        })
        }
        quotation.product_detail.forEach(prod => prod.product_logo = [])
        const saved_quotation = await quotation.save()
        if(!saved_quotation) {
        return res.json({message: 'can not saved quotation!'})
        }
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
        message: err.message
        })
    }
}