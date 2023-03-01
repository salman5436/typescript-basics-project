import express, { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'
import { loadConfig } from './app-config'

const app = express()
const config = loadConfig()!

//Typing StationCache here which is used by second API endpoint(for stopid):
const stationCache = new Map<string, StopResponse['ResponseData']>()



type Deviation = {
    Text: string
    Consequence: 'CANCELLED' | 'INFORMATION' | null
    ImportanceLevel: number
}[]

interface TransportInfo {
    GroupOfLine: string
    TransportMode: string
    LineNumber: string
    Destination: string
    JourneyDirection: number
    StopAreaName: string
    StopAreaNumber: number
    StopPointNumber: number
    StopPointDesignation: string
    TimeTabledDateTime: Date
    ExpectedDateTime: Date
    DisplayTime: string
    JourneyNumber: number
    Deviations: Deviation[] | null
    SecondaryDestinationName?: null
}

interface StationInfo {
    ResponseData: {
      LatestUpdate: string
      DataAge: number
      Metros: TransportInfo[]
      Buses: TransportInfo[]
      Trains: TransportInfo[]
      Trams: TransportInfo[]
      Ships: TransportInfo[]
      StopPointDeviations: {
        StopInfo: {
          StopAreaNumber: number
          StopAreaName: string
          TransportMode: string
          GroupOfLine: string
        }
        Deviation: Deviation
      }
    }
  }

  

  //creating new interface for StopResponse, which is used by second API call for stopID:
interface StopResponse {
    StatusCode: number
    Message: null
    ExecutionTime: number
    ResponseData: {
        Name: string
        SiteId: string
        Type: Type
        X: string
        Y: string
        Products: null
    }
}

export enum Type {
    Station = "Station"
}


// were going to create our api here
app.get('/times/:stationId', async (req, res, next) => {
    try {
        const schema = z.object({
            stationId: z.string().transform(val => Number(val)),
        })
        const { stationId } = schema.parse(req.params)

        const apiCall = await fetch(`${config.apiUrl}/realtimedeparturesV4.json?key=${config.apiKey}&siteId=${stationId}&timewindow=60`)
        //Now we will call the api and get the data as json object, typed with the response object 
        const data: StationInfo = await apiCall.json()

        res.json({
            stationId,
            results: data.ResponseData
        })
    } catch(err) {
        // if(err instanceof ZodError) {
        //     res.status(422).send('Invalid Station ID')
        // }
        next(err)
    }
})

app.get('/stations', async(req: Request<never, any, never, {q: string}>, res, next) => {
    try {
       const schema = z.object({ q: z.string() })
       const { q } = schema.parse(req.query)


       if(stationCache.has(q)) {
        return res.json({
            query: q,
            results: stationCache.get(q)
        })
       }

       const apiCall = await fetch(`${config.apiUrl}/typeahead.json?key=${config.stopLookupApiKey}&searchstring=${q}&stationsonly=true&maxresults=10`)
       const stations: StopResponse = await apiCall.json()
       stationCache.set(q, stations.ResponseData)

       res.json({
        query: q,
        results: stations.ResponseData,
       })
    } catch(err) {
        next(err)
    }
})


app.listen(config?.port, () => {
    console.log(`Port is listening on ${config.port}`)
})