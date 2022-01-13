package main

import (
	_ "embed"
	"os"
	"path/filepath"

	"encoding/base64"
	"image"
	"image/color"
	"sort"

	"github.com/wailsapp/wails"

	"gocv.io/x/gocv"
)

//CustomContour useful for holding Contour pointsVector
type CustomContour struct {
	c     gocv.PointsVector
	index int
	area  float64
}

func (cc CustomContour) Len() int {
	return cc.c.Size()
}

func (cc CustomContour) Less(i, j int) bool {
	aI := gocv.ContourArea(cc.c.At(i))
	aJ := gocv.ContourArea(cc.c.At(j))
	if aI > aJ {
		return true
	}
	return false
}

func (cc CustomContour) Swap(i, j int) {
	cc.c.ToPoints()[i], cc.c.ToPoints()[j] = cc.c.ToPoints()[j], cc.c.ToPoints()[i]
}

func basic(name string, file string) bool {
	newpath := filepath.Join(".", "Output")
	err := os.MkdirAll(newpath, os.ModePerm)

	sDec, _ := base64.StdEncoding.DecodeString(file)

	img, err := gocv.IMDecode(sDec, gocv.IMReadAnyColor)
	if err != nil {
		return false
	}

	defer img.Close()
	if img.Empty() {
		return false
	}
	blur := gocv.NewMat()
	gocv.GaussianBlur(img, &blur, image.Pt(3, 3), 1, 1, gocv.BorderDefault)

	eroded := gocv.NewMat()
	{
		kernel := gocv.GetStructuringElement(gocv.MorphRect, image.Pt(20, 20))
		defer kernel.Close()
		gocv.Erode(blur, &eroded, kernel)
	}

	medianBlur := gocv.NewMat()
	gocv.MedianBlur(eroded, &medianBlur, 9)

	morph := gocv.NewMat()
	{
		kernel := gocv.GetStructuringElement(gocv.MorphRect, image.Pt(3, 3))
		defer kernel.Close()

		gocv.MorphologyEx(medianBlur, &morph, gocv.MorphClose, kernel)
	}

	edges := gocv.NewMat()
	gocv.Canny(morph, &edges, 50, 200)
	contours := gocv.FindContours(edges, gocv.RetrievalExternal, gocv.ChainApproxSimple)

	var toSort CustomContour
	toSort.c = contours

	sort.Sort(CustomContour(toSort))

	statusColor := color.RGBA{255, 0, 0, 0}

	if toSort.c.Size() > 0 {
		gocv.FillPoly(&img, toSort.c, statusColor)
	}

	if img.Empty() {
		return false
	}

	if ok := gocv.IMWrite(".\\Output\\"+name, img); !ok {
		return false
	}
	return true

}

//go:embed frontend/build/static/js/main.js
var js string

//go:embed frontend/build/static/css/main.css
var css string

func main() {

	app := wails.CreateApp(&wails.AppConfig{
		Width:  1024,
		Height: 768,
		Title:  "BngTracer",
		JS:     js,
		CSS:    css,
		Colour: "#131313",
	})
	app.Bind(basic)
	app.Run()
}
