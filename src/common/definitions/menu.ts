export enum MenuKey {
  AddText = 'addText',
  ImageRecognition = 'imageRecognition',
  ExtractText = 'extractText',
  RemoveBackground = 'removeBackground',
  ImageCompletion = 'imageCompletion',
  ImageGeneration = 'imageGeneration'
}

export interface IMenuItem {
  key: MenuKey
  titleKey: string
  icon: string
  tag?: string
  tagColor?: string
}
