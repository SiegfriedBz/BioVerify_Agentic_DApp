import { AddressDisplay } from "@/app/_components/address-display"
import { TypographyH4, TypographyP, TypographySmall } from "@/app/_components/typography"
import { MappedProtocolPublication } from "@/app/_schemas/mappers/protocol-publication-mapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LandmarkIcon, UsersIcon } from "lucide-react"
import { FC } from "react"

type Props = {
  publication: MappedProtocolPublication
}

export const EconomicsSidebar: FC<Props> = ({ publication }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Stake Distribution */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <LandmarkIcon className="h-4 w-4 text-primary" />
            <TypographyH4 className="text-sm uppercase tracking-wider">Stake Distribution</TypographyH4>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end border-b border-border/50 pb-3">
            <TypographySmall className="text-muted-foreground">Publisher Stake</TypographySmall>
            <div className="text-right">
              <span className="font-mono font-bold text-lg">{publication.stakes}</span>
              <TypographySmall className="ml-1 text-[10px] text-muted-foreground">ETH</TypographySmall>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <TypographySmall className="text-muted-foreground">Submission Fee</TypographySmall>
            <div className="text-right">
              <span className="font-mono font-medium text-sm">{publication.paidSubmissionFee}</span>
              <TypographySmall className="ml-1 text-[10px] text-muted-foreground">ETH</TypographySmall>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participant List */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" />
            <TypographyH4 className="text-sm uppercase tracking-wider">Protocol Participants</TypographyH4>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Senior Reviewer */}
          <div className="space-y-2">
            <TypographySmall className="text-[10px] font-bold text-primary uppercase">Senior Reviewer</TypographySmall>
            {publication.seniorReviewer ? (
              <AddressDisplay address={publication.seniorReviewer} />
            ) : (
              <TypographyP className="text-xs italic text-muted-foreground">Waiting for VRF...</TypographyP>
            )}
          </div>

          {/* Peer Reviewers */}
          <div className="space-y-2">
            <TypographySmall className="text-[10px] font-bold text-muted-foreground uppercase">Peer Review Pool</TypographySmall>
            <div className="flex flex-col gap-1">
              {publication.reviewers.length > 0 ? (
                publication.reviewers.map((rev) => (
                  <AddressDisplay key={rev} address={rev} className="h-8 justify-start px-0" />
                ))
              ) : (
                <TypographyP className="text-xs italic text-muted-foreground">Waiting for VRF...</TypographyP>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}